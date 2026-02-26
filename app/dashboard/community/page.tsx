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

export default function CommunityPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [todayCompletedSessions, setTodayCompletedSessions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardProfile[]>([]);
  const [favorites, setFavorites] = useState<FavoritePartner[]>([]);
  const [loading, setLoading] = useState(true);

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

      const leaderboardWithRank = (leaderboardData || []).map((p, index) => ({
        ...p,
        rank: index + 1,
      }));
      setLeaderboard(leaderboardWithRank as any);

      // Fetch favorite partners
      const { data: favoriteIds } = await supabase
        .from('favorites')
        .select('favorite_id')
        .eq('user_id', userId);

      if (favoriteIds && favoriteIds.length > 0) {
        const ids = favoriteIds.map((f) => f.favorite_id);
        const { data: favoriteProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, role, city, total_sessions')
          .in('id', ids);

        setFavorites((favoriteProfiles || []) as FavoritePartner[]);
      } else {
        setFavorites([]);
      }

      setLoading(false);
    };

    fetchCommunityData();
  }, [userId]);
  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen p-8 flex items-center justify-center">
        <p className="text-[#9E9E9E]">Loading community data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Community</h1>
        <p className="text-[#9E9E9E]">Connect with warriors around you</p>
      </div>

      {/* 3 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Total Warriors */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-2">Total Warriors</p>
          <p className="text-3xl font-bold text-white">{totalProfiles}</p>
          <p className="text-xs text-[#616161] mt-3">In the community</p>
        </div>

        {/* Sessions Today */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⚔️</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-2">Sessions Today</p>
          <p className="text-3xl font-bold text-[#F9A825]">{todayCompletedSessions}</p>
          <p className="text-xs text-[#616161] mt-3">Completed sessions</p>
        </div>

        {/* Total Warriors (Placeholder) */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🟢</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-2">Warriors Online</p>
          <p className="text-3xl font-bold text-[#4CAF50]">{totalProfiles}</p>
          <p className="text-xs text-[#616161] mt-3">In the community</p>
        </div>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEADERBOARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            {leaderboard.length > 0 ? 'Top Warriors' : 'No data yet'}
          </h2>

          {leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((warrior, index) => (
                <div
                  key={warrior.id}
                  className="flex items-center justify-between py-4 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F9A825] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#0A0A0A]">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {warrior.full_name}
                      </p>
                      <p className="text-xs text-[#616161]">
                        🔥 {warrior.streak_best} day streak
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#4CAF50]">
                    {warrior.total_sessions} sessions
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#9E9E9E] text-center py-8">
              No leaderboard data yet
            </p>
          )}
        </div>

        {/* FAVORITE PARTNERS */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            {favorites.length > 0 ? 'Favorite Partners' : 'No data yet'}
          </h2>

          {favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((partner) => {
                const initials = partner.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();
                return (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between py-4 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#0A0A0A]">
                            {initials}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {partner.full_name}
                        </p>
                        <p className="text-xs text-[#616161]">
                          {partner.role} • {partner.city}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#F9A825]">
                      {partner.total_sessions}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[#9E9E9E] text-center py-8">
              No favorites yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
