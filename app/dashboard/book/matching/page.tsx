'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function MatchingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const duration = searchParams.get('duration') || '50';
  const mode = searchParams.get('mode') || 'video';
  const matchType = searchParams.get('match') || 'anyone';

  const [isMatched, setIsMatched] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [partnerStreak, setPartnerStreak] = useState(0);
  const [partnerSessions, setPartnerSessions] = useState(0);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function findMatch() {
      try {
        // Call the match_session function in Supabase
        const { data, error } = await supabase.rpc('match_session', {
          p_user_id: user!.id,
          p_duration: parseInt(duration),
          p_mode: mode,
          p_match_type: matchType,
        });

        if (error) throw error;

        const matchedSessionId = data as string;
        setSessionId(matchedSessionId);

        // Check if we're the host (we created a new open session) or partner (joined existing)
        const { data: session } = await supabase
          .from('sessions')
          .select('host_id, partner_id, status')
          .eq('id', matchedSessionId)
          .single();

        if (session) {
          const weAreHost = session.host_id === user!.id;
          setIsHost(weAreHost);

          if (session.status === 'matched' || session.partner_id) {
            // Already matched — get partner info
            const partnerId = weAreHost ? session.partner_id : session.host_id;
            await fetchPartnerInfo(partnerId!);
            setIsMatched(true);
          } else {
            // We created a new session, wait for someone to join
            waitForMatch(matchedSessionId);
          }
        }
      } catch (err) {
        console.error('Matching error:', err);
        setMatchError('Matching failed. Please try again.');
      }
    }

    findMatch();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to session updates to detect when partner joins
  function waitForMatch(sid: string) {
    const channel = supabase
      .channel(`match:${sid}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sid}` },
        async (payload) => {
          const updated = payload.new as { status: string; partner_id: string; host_id: string };
          if (updated.status === 'matched' && updated.partner_id) {
            const partnerId = isHost ? updated.partner_id : updated.host_id;
            await fetchPartnerInfo(partnerId);
            setIsMatched(true);
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    // Timeout after 2 minutes
    setTimeout(() => {
      if (!isMatched) {
        supabase.removeChannel(channel);
        setMatchError('No partners available right now. Try again in a few minutes.');
      }
    }, 120000);
  }

  async function fetchPartnerInfo(partnerId: string) {
    const { data: partner } = await supabase
      .from('profiles')
      .select('full_name, city, role, streak_current, total_sessions')
      .eq('id', partnerId)
      .single();

    if (partner) {
      setPartnerName(partner.full_name);
      setPartnerCity(partner.city || '');
      setPartnerStreak(partner.streak_current || 0);
      setPartnerSessions(partner.total_sessions || 0);
    }
  }

  const handleStartSession = () => {
    if (sessionId) {
      router.push(
        `/dashboard/book/session?id=${sessionId}&duration=${duration}&mode=${mode}&host=${isHost}`
      );
    }
  };

  const handleCancel = () => {
    // Cancel the open session
    if (sessionId) {
      supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId)
        .then(() => {});
    }
    router.push('/dashboard/book');
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
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        {matchError ? (
          <>
            <div className="mb-8 text-6xl">😤</div>
            <h1 className="text-3xl font-bold text-white mb-4">{matchError}</h1>
            <button
              onClick={() => router.push('/dashboard/book')}
              className="bg-[#F9A825] text-[#0A0A0A] font-bold py-3 px-8 rounded-lg hover:bg-[#F9B840] transition-all duration-200"
            >
              Try Again
            </button>
          </>
        ) : !isMatched ? (
          <>
            {/* Spinning Circle */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-[#2A2A2A] border-t-[#F9A825] animate-spin" />
            </div>

            {/* Loading Text */}
            <h1 className="text-3xl font-bold text-white mb-2">Finding your partner...</h1>
            <p className="text-[#9E9E9E] mb-2">
              {duration} min {mode} session
            </p>
            <p className="text-[#9E9E9E] text-sm mb-8">This won&apos;t take long</p>

            <button
              onClick={handleCancel}
              className="text-[#9E9E9E] hover:text-white transition-colors text-sm underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* Matched Partner Info */}
            <div className="mb-8">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {getInitials(partnerName)}
                  </span>
                </div>
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold text-white mb-2">{partnerName}</h1>

              {/* Role and Location */}
              {partnerCity && (
                <p className="text-lg text-[#9E9E9E] mb-4">{partnerCity}</p>
              )}

              {/* Streak */}
              {partnerStreak > 0 && (
                <p className="text-lg text-[#F9A825] font-semibold mb-8">
                  {partnerStreak}-day streak
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2A2A2A]">
                  <p className="text-[#9E9E9E] text-sm mb-1">Sessions</p>
                  <p className="text-2xl font-bold text-white">{partnerSessions}</p>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2A2A2A]">
                  <p className="text-[#9E9E9E] text-sm mb-1">Mode</p>
                  <p className="text-2xl font-bold text-white capitalize">{mode}</p>
                </div>
              </div>
            </div>

            {/* Start Session Button */}
            <button
              onClick={handleStartSession}
              className="bg-[#F9A825] text-[#0A0A0A] font-bold py-4 px-12 rounded-lg hover:bg-[#F9B840] transition-all duration-200 text-lg mb-4 inline-flex items-center gap-2"
            >
              START SESSION
            </button>

            <p className="text-[#9E9E9E] text-sm">
              You&apos;re all set. Let&apos;s build something great together.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
