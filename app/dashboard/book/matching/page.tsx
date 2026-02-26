'use client';

import { useEffect, useState } from 'react';
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
