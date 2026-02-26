'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [ratingSaved, setRatingSaved] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  const sessionId = searchParams.get('session');
  const duration = searchParams.get('duration') || '50';

  // Fetch session data and partner info
  useEffect(() => {
    if (!sessionId || !user) return;
    const fetchSession = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (data) {
        setSessionData(data);
        const pId = data.host_id === user.id ? data.partner_id : data.host_id;
        setPartnerId(pId);

        // Fetch partner name
        if (pId) {
          const { data: partner } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', pId)
            .single();
          if (partner) setPartnerName(partner.full_name);

          // Check if already favorited
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('favorite_id', pId)
            .maybeSingle();
          if (fav) setIsFavorited(true);
        }
      }
    };
    fetchSession();
  }, [sessionId, user]);

  const toggleFavorite = async () => {
    if (!user || !partnerId || togglingFav) return;
    setTogglingFav(true);
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('favorite_id', partnerId);
        setIsFavorited(false);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, favorite_id: partnerId });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setTogglingFav(false);
    }
  };

  const handleRate = async (value: string) => {
    setSelectedRating(value);
    if (!sessionId || !user || ratingSaved) return;

    // Map rating to a number
    const ratingMap: Record<string, number> = {
      fire: 5,
      good: 4,
      okay: 3,
      bad: 1,
    };

    const ratingField = sessionData?.host_id === user.id ? 'host_rating' : 'partner_rating';

    const { error } = await supabase
      .from('sessions')
      .update({ [ratingField]: ratingMap[value] })
      .eq('id', sessionId);

    if (!error) {
      setRatingSaved(true);
    }
  };

  const ratings = [
    { value: 'fire', icon: '🔥', label: 'Fire' },
    { value: 'good', icon: '👍', label: 'Good' },
    { value: 'okay', icon: '😐', label: 'Okay' },
    { value: 'bad', icon: '👎', label: 'Bad' },
  ];

  const stats = [
    { label: 'Duration', value: `${duration} min`, icon: '⏱️' },
    { label: 'Streak', value: `🔥 ${profile?.streak_current || 0} days`, icon: null },
    { label: 'Total', value: `#${profile?.total_sessions || 0}`, icon: '⚔️' },
    { label: 'Hours', value: `${profile?.total_hours?.toFixed(1) || '0'}h`, icon: '📊' },
  ];

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center p-4 md:p-6">
      <div className="text-center max-w-2xl w-full">
        {/* Success Icon */}
        <motion.div
          className="text-5xl md:text-6xl mb-4 md:mb-6"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        >
          ⚔️
        </motion.div>

        {/* Main Message */}
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-[#F9A825] mb-2 md:mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          MISSION COMPLETE
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-white mb-8 md:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          You showed up. That&apos;s the win.
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } },
          }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-[#1E1E1E] p-4 md:p-6 rounded-lg border border-[#2A2A2A]"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
              }}
            >
              {stat.icon && <div className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.icon}</div>}
              <p className="text-[#9E9E9E] text-xs md:text-sm mb-1 md:mb-2">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Rating Section */}
        <motion.div
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-white font-semibold mb-4">
            {ratingSaved ? 'Thanks for rating!' : 'How was this session?'}
          </p>
          <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
            {ratings.map((rating) => (
              <button
                key={rating.value}
                onClick={() => handleRate(rating.value)}
                disabled={ratingSaved}
                className={`flex flex-col items-center gap-1 md:gap-2 px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all duration-200 ${
                  selectedRating === rating.value
                    ? 'bg-[#F9A825] text-[#0A0A0A]'
                    : 'bg-[#1E1E1E] text-white border border-[#2A2A2A] hover:border-[#F9A825]'
                } ${ratingSaved && selectedRating !== rating.value ? 'opacity-40' : ''}`}
              >
                <span className="text-xl md:text-2xl">{rating.icon}</span>
                <span className="text-xs md:text-sm font-semibold">{rating.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Favorite Partner */}
        {partnerId && partnerName && (
          <div className="mb-8 md:mb-12">
            <button
              onClick={toggleFavorite}
              disabled={togglingFav}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isFavorited
                  ? 'bg-[#F9A825] bg-opacity-15 border border-[#F9A825] text-[#F9A825]'
                  : 'bg-[#1E1E1E] border border-[#2A2A2A] text-white hover:border-[#F9A825]'
              }`}
            >
              {togglingFav ? '...' : isFavorited ? `⭐ ${partnerName} is a favorite` : `☆ Add ${partnerName} to favorites`}
            </button>
          </div>
        )}

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <button
            onClick={() => router.push('/dashboard/book')}
            className="bg-[#F9A825] text-[#0A0A0A] font-bold py-3 md:py-4 px-8 md:px-12 rounded-lg hover:bg-[#F9B840] transition-all duration-200 text-base md:text-lg"
          >
            Book Another Session
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#1E1E1E] text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded-lg border border-[#2A2A2A] hover:border-white transition-all duration-200 text-base md:text-lg"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
