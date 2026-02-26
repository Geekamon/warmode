'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const duration = searchParams.get('duration') || '50';
  const mode = searchParams.get('mode') || 'video';
  const matchType = searchParams.get('match') || 'anyone';
  const goal = searchParams.get('goal') || '';
  const scheduledTime = searchParams.get('time') || '';
  const scheduledDate = searchParams.get('date') || '';
  const joinSessionId = searchParams.get('join') || ''; // direct join from lobby

  const [isMatched, setIsMatched] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [partnerStreak, setPartnerStreak] = useState(0);
  const [partnerSessions, setPartnerSessions] = useState(0);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Refs to avoid stale closures in callbacks/timers
  const isMatchedRef = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync
  useEffect(() => { isMatchedRef.current = isMatched; }, [isMatched]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

      // Send match email (fire and forget)
      if (user?.email && profile) {
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'matched',
            to: user.email,
            name: profile.full_name,
            partnerName: partner.full_name,
            duration: parseInt(duration),
            scheduledAt: new Date().toISOString(),
          }),
        }).catch(() => {});
      }
    }
  }

  async function handleMatchFound(partnerId: string) {
    if (isMatchedRef.current) return; // prevent double-trigger
    isMatchedRef.current = true;
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await fetchPartnerInfo(partnerId);
    setIsMatched(true);
  }

  useEffect(() => {
    if (!user?.id) return;

    async function findMatch() {
      try {
        let matchedSessionId: string;

        if (joinSessionId) {
          // Direct join — user clicked JOIN on an open session from the lobby
          const { error: joinError } = await supabase
            .from('sessions')
            .update({ partner_id: user!.id, status: 'matched' })
            .eq('id', joinSessionId)
            .eq('status', 'open');

          if (joinError) throw joinError;
          matchedSessionId = joinSessionId;
        } else {
          // Normal flow — call the match_session RPC
          const { data, error } = await supabase.rpc('match_session', {
            p_user_id: user!.id,
            p_duration: parseInt(duration),
            p_mode: mode,
            p_match_type: matchType,
          });

          if (error) throw error;
          matchedSessionId = data as string;
        }

        setSessionId(matchedSessionId);

        // Small delay to let the transaction fully commit before reading
        await new Promise((r) => setTimeout(r, 500));

        // Read session back — retry up to 3 times if status hasn't propagated
        let session = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data: s } = await supabase
            .from('sessions')
            .select('host_id, partner_id, status')
            .eq('id', matchedSessionId)
            .single();
          session = s;
          if (session && (session.status === 'matched' || session.host_id === user!.id)) break;
          await new Promise((r) => setTimeout(r, 500));
        }

        if (session) {
          const weAreHost = session.host_id === user!.id;
          setIsHost(weAreHost);

          // Save goal to session
          if (goal) {
            const goalField = weAreHost ? 'host_goal' : 'partner_goal';
            await supabase
              .from('sessions')
              .update({ [goalField]: goal })
              .eq('id', matchedSessionId);
          }

          if (session.partner_id && (session.status === 'matched' || !weAreHost)) {
            // We joined an existing session or session is already matched
            const partnerId = weAreHost ? session.partner_id : session.host_id;
            await handleMatchFound(partnerId!);
          } else {
            // We created a new open session — wait for partner to join
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

  // Poll + Realtime to detect when partner joins
  function waitForMatch(sid: string) {
    // 1) Try Realtime subscription (only works if Realtime is enabled on sessions table)
    const channel = supabase
      .channel(`match:${sid}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sid}` },
        async (payload) => {
          const updated = payload.new as { status: string; partner_id: string; host_id: string };
          if (updated.status === 'matched' && updated.partner_id) {
            supabase.removeChannel(channel);
            // We're the host (we're waiting), so partner_id is our match
            await handleMatchFound(updated.partner_id);
          }
        }
      )
      .subscribe();

    // 2) Polling fallback — check every 3 seconds in case Realtime isn't enabled
    pollingRef.current = setInterval(async () => {
      if (isMatchedRef.current) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        supabase.removeChannel(channel);
        return;
      }

      try {
        const { data: session } = await supabase
          .from('sessions')
          .select('status, partner_id')
          .eq('id', sid)
          .single();

        if (session && session.status === 'matched' && session.partner_id) {
          supabase.removeChannel(channel);
          await handleMatchFound(session.partner_id);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    // 3) Timeout after 2 minutes
    timeoutRef.current = setTimeout(() => {
      if (!isMatchedRef.current) {
        supabase.removeChannel(channel);
        if (pollingRef.current) clearInterval(pollingRef.current);
        setMatchError('No partners available right now. Try again in a few minutes.');
      }
    }, 120000);
  }

  const handleStartSession = () => {
    if (sessionId) {
      router.push(
        `/dashboard/book/session?id=${sessionId}&duration=${duration}&mode=${mode}&host=${isHost}`
      );
    }
  };

  const handleCancel = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
      <AnimatePresence mode="wait">
        {matchError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="mb-8 text-6xl">😤</div>
            <h1 className="text-3xl font-bold text-white mb-4">{matchError}</h1>
            <button
              onClick={() => router.push('/dashboard/book')}
              className="bg-[#F9A825] text-[#0A0A0A] font-bold py-3 px-8 rounded-lg hover:bg-[#F9B840] transition-all duration-200"
            >
              Try Again
            </button>
          </motion.div>
        ) : !isMatched ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            {/* Pulsing Ring */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-[#2A2A2A] border-t-[#F9A825] animate-spin" />
                <motion.div
                  className="absolute inset-[-8px] rounded-full border-2 border-[#F9A825]"
                  animate={{ opacity: [0.3, 0.08, 0.3], scale: [1, 1.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>

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
          </motion.div>
        ) : (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-center"
          >
            {/* Matched Partner Info */}
            <div className="mb-8">
              {/* Avatar */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0A0A0A]">
                    {getInitials(partnerName)}
                  </span>
                </div>
              </motion.div>

              <motion.h1
                className="text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {partnerName}
              </motion.h1>

              {partnerCity && (
                <motion.p
                  className="text-lg text-[#9E9E9E] mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {partnerCity}
                </motion.p>
              )}

              {partnerStreak > 0 && (
                <motion.p
                  className="text-lg text-[#F9A825] font-semibold mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {partnerStreak}-day streak
                </motion.p>
              )}

              <motion.div
                className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2A2A2A]">
                  <p className="text-[#9E9E9E] text-sm mb-1">Sessions</p>
                  <p className="text-2xl font-bold text-white">{partnerSessions}</p>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2A2A2A]">
                  <p className="text-[#9E9E9E] text-sm mb-1">Mode</p>
                  <p className="text-2xl font-bold text-white capitalize">{mode}</p>
                </div>
              </motion.div>
            </div>

            <motion.button
              onClick={handleStartSession}
              className="bg-[#F9A825] text-[#0A0A0A] font-bold py-4 px-12 rounded-lg hover:bg-[#F9B840] transition-all duration-200 text-lg mb-4 inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              START SESSION
            </motion.button>

            <motion.p
              className="text-[#9E9E9E] text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              You&apos;re all set. Let&apos;s build something great together.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
