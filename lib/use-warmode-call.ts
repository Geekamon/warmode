'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WarModeCall, WebRTCConfig } from './webrtc';

export type CallState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'ended';

interface UseWarModeCallOptions {
  sessionId: string;
  userId: string;
  isHost: boolean;
  mode: 'video' | 'audio';
}

interface UseWarModeCallReturn {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  cameraOff: boolean;
  error: string | null;
  encrypted: boolean;
  toggleMute: () => void;
  toggleCamera: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
}

export function useWarModeCall(options: UseWarModeCallOptions): UseWarModeCallReturn {
  const { sessionId, userId, isHost, mode } = options;

  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encrypted, setEncrypted] = useState(false);

  const callRef = useRef<WarModeCall | null>(null);

  const startCall = useCallback(async () => {
    try {
      setCallState('connecting');
      setError(null);

      const config: WebRTCConfig = {
        sessionId,
        userId,
        isHost,
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
        },
        onConnectionState: (state) => {
          switch (state) {
            case 'connected':
            case 'completed':
              setCallState('connected');
              setEncrypted(true);
              break;
            case 'disconnected':
              setCallState('reconnecting');
              break;
            case 'failed':
              setCallState('failed');
              break;
            case 'closed':
              setCallState('ended');
              break;
            default:
              break;
          }
        },
        onError: (errorMsg) => {
          setError(errorMsg);
        },
      };

      const call = new WarModeCall(config);
      callRef.current = call;

      // Get local media
      const stream = await call.getLocalStream(mode);
      setLocalStream(stream);

      // Connect (signaling + WebRTC)
      await call.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start call';
      setError(message);
      setCallState('failed');
    }
  }, [sessionId, userId, isHost, mode]);

  const endCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect();
      callRef.current = null;
    }
    setCallState('ended');
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const toggleMute = useCallback(() => {
    if (callRef.current) {
      const muted = callRef.current.toggleMute();
      setIsMuted(muted);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (callRef.current) {
      const off = callRef.current.toggleCamera();
      setCameraOff(off);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.disconnect();
        callRef.current = null;
      }
    };
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    cameraOff,
    error,
    encrypted,
    toggleMute,
    toggleCamera,
    startCall,
    endCall,
  };
}
