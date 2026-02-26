'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useWarModeCall, CallState } from '@/lib/use-warmode-call';
import { supabase } from '@/lib/supabase';

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  // Session params from URL
  const sessionId = searchParams.get('id') || 'demo-session';
  const duration = parseInt(searchParams.get('duration') || '50');
  const mode = (searchParams.get('mode') || 'video') as 'video' | 'audio';
  const isHost = searchParams.get('host') === 'true';

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Partner info
  const [partnerName, setPartnerName] = useState('Connecting...');
  const [partnerCity, setPartnerCity] = useState('');
  const [partnerGoal, setPartnerGoal] = useState('');

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // WebRTC call
  const {
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
  } = useWarModeCall({
    sessionId,
    userId: user?.id || '',
    isHost,
    mode,
  });

  // Start call on mount
  useEffect(() => {
    if (user?.id) {
      startCall();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Start timer when connected
  useEffect(() => {
    if (callState === 'connected' && !sessionStarted) {
      setSessionStarted(true);

      // Mark session as active in DB
      supabase
        .from('sessions')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', sessionId)
        .then(() => {});
    }
  }, [callState, sessionStarted, sessionId]);

  // Countdown timer
  useEffect(() => {
    if (!sessionStarted) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch partner info
  useEffect(() => {
    async function fetchPartner() {
      if (!sessionId || sessionId === 'demo-session') {
        setPartnerName('Waiting for partner...');
        return;
      }

      const { data: session } = await supabase
        .from('sessions')
        .select('host_id, partner_id, host_goal, partner_goal')
        .eq('id', sessionId)
        .single();

      if (session) {
        const partnerId = isHost ? session.partner_id : session.host_id;
        if (partnerId) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('full_name, city, role')
            .eq('id', partnerId)
            .single();

          if (partnerProfile) {
            setPartnerName(partnerProfile.full_name);
            setPartnerCity(partnerProfile.city || '');
          }
        }

        const goal = isHost ? session.partner_goal : session.host_goal;
        if (goal) setPartnerGoal(goal);
      }
    }

    fetchPartner();
  }, [sessionId, isHost]);

  const handleEndSession = useCallback(() => {
    endCall();

    // Mark session complete
    supabase
      .from('sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId)
      .then(() => {});

    router.push(`/dashboard/book/complete?id=${sessionId}&duration=${duration}`);
  }, [endCall, sessionId, duration, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  // Status text for connection state
  const getStatusText = (state: CallState): string => {
    switch (state) {
      case 'connecting': return 'Connecting...';
      case 'connected': return encrypted ? 'Connected (Encrypted)' : 'Connected';
      case 'reconnecting': return 'Reconnecting...';
      case 'failed': return 'Connection failed';
      case 'ended': return 'Session ended';
      default: return 'Starting...';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col">
      {/* TOP: WAR MODE ACTIVE BANNER */}
      <div className="bg-[#D32F2F] text-white font-bold py-3 px-6 text-center flex items-center justify-center gap-4">
        <span className="animate-pulse">WAR MODE ACTIVE</span>
        <span className="text-sm font-normal opacity-80">
          {getStatusText(callState)}
          {encrypted && ' 🔒'}
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#FF6F00] text-white py-2 px-6 text-center text-sm">
          {error}
          {callState === 'failed' && (
            <button
              onClick={() => startCall()}
              className="ml-4 underline font-semibold"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* MIDDLE: Video Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Partner (Remote) */}
        <div className="flex-1 border-r border-[#2A2A2A] relative bg-[#111111]">
          {remoteStream && mode === 'video' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-white">
                  {partnerName !== 'Connecting...' && partnerName !== 'Waiting for partner...'
                    ? getInitials(partnerName)
                    : '?'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{partnerName}</h2>
              {partnerCity && (
                <p className="text-[#9E9E9E] text-lg mb-4">{partnerCity}</p>
              )}
              {mode === 'audio' && callState === 'connected' && (
                <div className="flex items-center gap-2 text-[#4CAF50]">
                  <div className="w-3 h-3 rounded-full bg-[#4CAF50] animate-pulse" />
                  <span>Audio connected</span>
                </div>
              )}
              {callState === 'connecting' && (
                <div className="mt-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#F9A825] animate-spin mx-auto" />
                  <p className="text-[#9E9E9E] text-sm mt-2">Waiting for partner...</p>
                </div>
              )}
            </div>
          )}

          {/* Partner name overlay */}
          {remoteStream && mode === 'video' && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
              {partnerName}
            </div>
          )}

          {/* Partner goal overlay */}
          {partnerGoal && (
            <div className="absolute top-4 left-4 bg-[#1E1E1E]/90 px-4 py-2 rounded-lg border border-[#2A2A2A]">
              <p className="text-[#9E9E9E] text-xs mb-1">Working on</p>
              <p className="text-white text-sm font-semibold">{partnerGoal}</p>
            </div>
          )}
        </div>

        {/* Right Panel - You (Local) */}
        <div className="flex-1 relative bg-[#0A0A0A]">
          {localStream && mode === 'video' && !cameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#F9A825] flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-[#0A0A0A]">
                  {profile ? getInitials(profile.full_name) : '?'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {profile?.full_name || 'You'}
              </h2>
              {profile?.city && (
                <p className="text-[#9E9E9E] text-lg mb-4">{profile.city}</p>
              )}
              {cameraOff && mode === 'video' && (
                <p className="text-[#9E9E9E] text-sm">Camera off</p>
              )}
              {mode === 'audio' && callState === 'connected' && (
                <div className="flex items-center gap-2 text-[#4CAF50]">
                  <div className="w-3 h-3 rounded-full bg-[#4CAF50] animate-pulse" />
                  <span>Audio connected</span>
                </div>
              )}
            </div>
          )}

          {/* Your name overlay */}
          {localStream && mode === 'video' && !cameraOff && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
              You {isMuted && '(Muted)'}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Control Bar */}
      <div className="bg-[#1E1E1E] border-t border-[#2A2A2A] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F9A825] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls and Timer */}
          <div className="flex items-center justify-between">
            {/* Control Buttons */}
            <div className="flex gap-4">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isMuted
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
                }`}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>

              {/* Camera Button (only in video mode) */}
              {mode === 'video' && (
                <button
                  onClick={toggleCamera}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    cameraOff
                      ? 'bg-[#D32F2F] text-white'
                      : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
                  }`}
                >
                  {cameraOff ? '❌ Camera Off' : '📹 Camera On'}
                </button>
              )}

              {/* Encryption indicator */}
              {encrypted && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#1B5E20]/30 text-[#4CAF50] text-sm">
                  🔒 End-to-end encrypted
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="font-mono text-6xl font-bold text-[#F9A825] mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-[#9E9E9E] text-sm">
                {sessionStarted ? 'Time remaining' : 'Waiting to start'}
              </p>
            </div>

            {/* End Session Button */}
            <button
              onClick={handleEndSession}
              className="bg-[#D32F2F] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#B71C1C] transition-all duration-200 text-lg"
            >
              END SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
