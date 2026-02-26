'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface LeaderboardProfile {
  id: string;
  full_name: string;
  total_sessions: number;
  streak_best: number;
}

interface FavoritePartner {
  id: string;
  full_name: string;
  role: string;
  city: string;
  total_sessions: number;
}

interface PastPartner {
  id: string;
  full_name: string;
  role: string;
  city: string;
  total_sessions: number;
  isFavorite: boolean;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [todayCompletedSessions, setTodayCompletedSessions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardProfile[]>([]);
  const [favorites, setFavorites] = useState<FavoritePartner[]>([]);
  const [pastPartners, setPastPartners] = useState<PastPartner[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);

  const fetchFavoriteIds = async () => {
    if (!userId) return new Set<string>();
    const { data } = await supabase
      .from('favorites')
      .select('favorite_id')
      .eq('user_id', userId);
    const ids = new Set((data || []).map((f) => f.favorite_id));
    setFavoriteIds(ids);
    return ids;
  };

  const fetchFavoriteProfiles = async (ids: Set<string>) => {
    if (ids.size === 0) {
      setFavorites([]);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, city, total_sessions')
      .in('id', Array.from(ids));
    setFavorites((data || []) as FavoritePartner[]);
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!userId) return;

      // Count total profiles
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setTotalProfiles(profileCount || 0);

      // Count today's completed sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: sessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('ended_at', today.toISOString())
        .lt('ended_at', tomorrow.toISOString());
      setTodayCompletedSessions(sessionsCount || 0);

      // Fetch top 10 profiles by total_sessions
      const { data: leaderboardData } = await supabase
        .from('profiles')
        .select('id, full_name, total_sessions, streak_best')
        .order('total_sessions', { ascending: false })
        .limit(10);
      setLeaderboard((leaderboardData || []) as LeaderboardProfile[]);

      // Fetch favorites
      const favIds = await fetchFavoriteIds();
      await fetchFavoriteProfiles(favIds);

      // Fetch past partners (people you've had sessions with)
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('host_id, partner_id')
        .or(`host_id.eq.${userId},partner_id.eq.${userId}`)
        .eq('status', 'completed');

      if (sessionsData) {
        const partnerIdSet = new Set<string>();
        sessionsData.forEach((s) => {
          if (s.host_id === userId && s.partner_id) partnerIdSet.add(s.partner_id);
          if (s.partner_id === userId && s.host_id) partnerIdSet.add(s.host_id);
        });

        if (partnerIdSet.size > 0) {
          const { data: partnerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, role, city, total_sessions')
            .in('id', Array.from(partnerIdSet));

          const partners = (partnerProfiles || []).map((p) => ({
            ...p,
            isFavorite: favIds.has(p.id),
          }));
          setPastPartners(partners as PastPartner[]);
        }
      }

      setLoading(false);
    };

    fetchCommunityData();
  }, [userId]);

  const toggleFavorite = async (partnerId: string) => {
    if (!userId || togglingFav) return;
    setTogglingFav(partnerId);

    try {
      const isFav = favoriteIds.has(partnerId);

      if (isFav) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('favorite_id', partnerId);

        const newIds = new Set(favoriteIds);
        newIds.delete(partnerId);
        setFavoriteIds(newIds);
        setFavorites(favorites.filter((f) => f.id !== partnerId));
        setPastPartners(pastPartners.map((p) =>
          p.id === partnerId ? { ...p, isFavorite: false } : p
        ));
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({ user_id: userId, favorite_id: partnerId });

        const newIds = new Set(favoriteIds);
        newIds.add(partnerId);
        setFavoriteIds(newIds);

        // Find partner in past partners or leaderboard to add to favorites list
        const partner = pastPartners.find((p) => p.id === partnerId);
        if (partner) {
          setFavorites([...favorites, { id: partner.id, full_name: partner.full_name, role: partner.role, city: partner.city, total_sessions: partner.total_sessions }]);
        }
        setPastPartners(pastPartners.map((p) =>
          p.id === partnerId ? { ...p, isFavorite: true } : p
        ));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setTogglingFav(null);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F9A825] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-4 md:p-8 pb-24 md:pb-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Community</h1>
        <p className="text-[#9E9E9E]">Connect with warriors around you</p>
      </div>

      {/* 3 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <span className="text-2xl">👥</span>
          <p className="text-[#9E9E9E] text-sm mb-1 mt-3">Total Warriors</p>
          <p className="text-3xl font-bold text-white">{totalProfiles}</p>
        </div>
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <span className="text-2xl">⚔️</span>
          <p className="text-[#9E9E9E] text-sm mb-1 mt-3">Sessions Today</p>
          <p className="text-3xl font-bold text-[#F9A825]">{todayCompletedSessions}</p>
        </div>
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <span className="text-2xl">⭐</span>
          <p className="text-[#9E9E9E] text-sm mb-1 mt-3">Your Favorites</p>
          <p className="text-3xl font-bold text-[#4CAF50]">{favorites.length}</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* LEADERBOARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Top Warriors</h2>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((warrior, index) => (
                <div
                  key={warrior.id}
                  className="flex items-center justify-between py-3 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index === 0 ? 'bg-[#F9A825]' : index === 1 ? 'bg-[#9E9E9E]' : index === 2 ? 'bg-[#CD7F32]' : 'bg-[#2A2A2A]'
                    }`}>
                      <span className="text-xs font-bold text-[#0A0A0A]">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{warrior.full_name}</p>
                      <p className="text-xs text-[#616161]">🔥 {warrior.streak_best} day best</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#4CAF50]">{warrior.total_sessions} sessions</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#9E9E9E] text-center py-8">No leaderboard data yet</p>
          )}
        </div>

        {/* FAVORITE PARTNERS */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Favorite Partners</h2>
          {favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between py-3 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#0A0A0A]">{getInitials(partner.full_name)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{partner.full_name}</p>
                      <p className="text-xs text-[#616161]">{partner.role} {partner.city ? `• ${partner.city}` : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(partner.id)}
                    disabled={togglingFav === partner.id}
                    className="text-[#F9A825] hover:text-[#D32F2F] transition-colors text-lg disabled:opacity-50"
                    title="Remove from favorites"
                  >
                    {togglingFav === partner.id ? '...' : '⭐'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#9E9E9E] text-center py-8">
              No favorites yet. Add partners from your session history below.
            </p>
          )}
        </div>

        {/* PAST PARTNERS — Add to Favorites */}
        {pastPartners.length > 0 && (
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-6">Your Session Partners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pastPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between py-3 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#0A0A0A]">{getInitials(partner.full_name)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{partner.full_name}</p>
                      <p className="text-xs text-[#616161]">
                        {partner.role} {partner.city ? `• ${partner.city}` : ''} • {partner.total_sessions} sessions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(partner.id)}
                    disabled={togglingFav === partner.id}
                    className={`text-lg transition-colors disabled:opacity-50 ${
                      partner.isFavorite
                        ? 'text-[#F9A825] hover:text-[#D32F2F]'
                        : 'text-[#616161] hover:text-[#F9A825]'
                    }`}
                    title={partner.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {togglingFav === partner.id ? '...' : partner.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
