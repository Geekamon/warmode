// WarMode WebRTC — Peer-to-peer video/audio for 1-on-1 sessions
// Uses Supabase Realtime for signaling, browser WebRTC for media

import { supabase } from "./supabase";

export interface WebRTCConfig {
  sessionId: string;
  userId: string;
  isHost: boolean;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionState: (state: string) => void;
  onError: (error: string) => void;
}

export class WarModeCall {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private config: WebRTCConfig;
  private iceCandidateQueue: RTCIceCandidate[] = [];

  constructor(config: WebRTCConfig) {
    this.config = config;
  }

  // Get ICE server config (STUN is free, TURN optional)
  private getIceServers(): RTCIceServer[] {
    const servers: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ];

    // Add TURN server if configured (for users behind strict firewalls)
    const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
    const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
    const turnPass = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

    if (turnUrl && turnUser && turnPass) {
      servers.push({
        urls: turnUrl,
        username: turnUser,
        credential: turnPass,
      });
    }

    return servers;
  }

  // Start local camera/mic
  async getLocalStream(mode: "video" | "audio"): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: mode === "video" ? { width: 640, height: 480, facingMode: "user" } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return this.localStream;
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        throw new Error("Camera/mic permission denied. Please allow access and try again.");
      } else if (error.name === "NotFoundError") {
        throw new Error("No camera or microphone found on this device.");
      }
      throw new Error("Could not access camera/microphone: " + error.message);
    }
  }

  // Set up the WebRTC connection and Supabase signaling
  async connect(): Promise<void> {
    const { sessionId, userId, isHost, onRemoteStream, onConnectionState, onError } = this.config;

    // Create peer connection
    this.pc = new RTCPeerConnection({
      iceServers: this.getIceServers(),
    });

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.pc!.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming remote stream
    this.pc.ontrack = (event) => {
      if (event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    // Monitor connection state
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc?.iceConnectionState || "unknown";
      onConnectionState(state);

      if (state === "failed") {
        onError("Connection failed. Check your internet and try again.");
      } else if (state === "disconnected") {
        // Attempt reconnection
        setTimeout(() => {
          if (this.pc?.iceConnectionState === "disconnected") {
            onError("Partner disconnected.");
          }
        }, 5000);
      }
    };

    // Set up Supabase Realtime channel for signaling
    this.channel = supabase.channel(`session:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    // Listen for signaling messages
    this.channel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (!isHost && this.pc) {
          try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);

            this.channel?.send({
              type: "broadcast",
              event: "answer",
              payload: { sdp: answer, from: userId },
            });

            // Flush queued ICE candidates
            this.flushIceCandidates();
          } catch (err) {
            onError("Failed to process offer: " + (err as Error).message);
          }
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (isHost && this.pc) {
          try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            this.flushIceCandidates();
          } catch (err) {
            onError("Failed to process answer: " + (err as Error).message);
          }
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.from !== userId && this.pc) {
          try {
            if (this.pc.remoteDescription) {
              await this.pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } else {
              this.iceCandidateQueue.push(new RTCIceCandidate(payload.candidate));
            }
          } catch (err) {
            // Non-fatal: some candidates may fail
            console.warn("ICE candidate error:", err);
          }
        }
      })
      .on("broadcast", { event: "hangup" }, () => {
        this.disconnect();
        onConnectionState("closed");
      });

    // Handle ICE candidates — send to partner via Supabase
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.channel?.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: event.candidate.toJSON(), from: userId },
        });
      }
    };

    // Subscribe to the channel
    await this.channel.subscribe();

    // If host, create and send offer
    if (isHost) {
      try {
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        this.channel.send({
          type: "broadcast",
          event: "offer",
          payload: { sdp: offer, from: userId },
        });
      } catch (err) {
        onError("Failed to create offer: " + (err as Error).message);
      }
    }
  }

  // Flush queued ICE candidates after remote description is set
  private async flushIceCandidates() {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift()!;
      try {
        await this.pc?.addIceCandidate(candidate);
      } catch (err) {
        console.warn("Failed to add queued ICE candidate:", err);
      }
    }
  }

  // Toggle mic
  toggleMute(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // returns true if now muted
    }
    return false;
  }

  // Toggle camera
  toggleCamera(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled; // returns true if now off
    }
    return false;
  }

  // Get encryption stats (for UI display)
  async getEncryptionInfo(): Promise<{ dtlsCipher: string; srtpCipher: string; encrypted: boolean }> {
    if (!this.pc) return { dtlsCipher: "N/A", srtpCipher: "N/A", encrypted: false };

    const stats = await this.pc.getStats();
    let dtlsCipher = "Unknown";
    let srtpCipher = "Unknown";

    stats.forEach((report) => {
      if (report.type === "transport") {
        dtlsCipher = report.dtlsCipher || "Active";
        srtpCipher = report.srtpCipher || "Active";
      }
    });

    return { dtlsCipher, srtpCipher, encrypted: true };
  }

  // End the call
  disconnect() {
    // Notify partner
    this.channel?.send({
      type: "broadcast",
      event: "hangup",
      payload: {},
    });

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Unsubscribe from channel
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.iceCandidateQueue = [];
  }
}
