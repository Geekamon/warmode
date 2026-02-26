'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  city: string;
  role: string;
  plan: string;
  streak_current: number;
  streak_best: number;
  total_sessions: number;
  total_hours: number;
}

interface Session {
  id: string;
  host_id: string;
  partner_id: string;
  duration: number;
  mode: string;
  status: string;
  scheduled_at: string;
  started_at: string;
  ended_at: string;
  host_goal: string;
  partner_goal: string;
}

interface RecentSession {
  id: string;
  partner_name: string;
  duration: number;
  ended_at: string;
  status: string;
}

interface WeekChartData {
  day: string;
  sessions: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  hours: number;
  location: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [nextSessionPartner, setNextSessionPartner] = useState<Profile | null>(null);
  const [weekData, setWeekData] = useState<WeekChartData[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [partnersCount, setPartnersCount] = useState(0);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingNextSession, setLoadingNextSession] = useState(true);
  const [loadingWeekData, setLoadingWeekData] = useState(true);
  const [loadingRecentSessions, setLoadingRecentSessions] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  // Fetch user profile
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Fetch next session
  useEffect(() => {
    if (!user?.id) return;

    const fetchNextSession = async () => {
      try {
        setLoadingNextSession(true);
        const now = new Date().toISOString();

        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .or(`host_id.eq.${user.id},partner_id.eq.${user.id}`)
          .gte('scheduled_at', now)
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setNextSession(data);

          // Fetch partner profile
          const partnerId = data.host_id === user.id ? data.partner_id : data.host_id;
          if (partnerId) {
            const { data: partnerData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', partnerId)
              .single();

            setNextSessionPartner(partnerData);
          }
        }
      } catch (err) {
        console.error('Error fetching next session:', err);
      } finally {
        setLoadingNextSession(false);
      }
    };

    fetchNextSession();
  }, [user?.id]);

  // Fetch this week's data
  useEffect(() => {
    if (!user?.id) return;

    const fetchWeekData = async () => {
      try {
        setLoadingWeekData(true);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
          .from('sessions')
          .select('started_at')
          .or(`host_id.eq.${user.id},partner_id.eq.${user.id}`)
          .eq('status', 'completed')
          .gte('started_at', sevenDaysAgo);

        if (error) throw error;

        // Group sessions by day of week
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const sessionsByDay: Record<string, number> = {
          Sun: 0,
          Mon: 0,
          Tue: 0,
          Wed: 0,
          Thu: 0,
          Fri: 0,
          Sat: 0,
        };

        data?.forEach((session) => {
          if (session.started_at) {
            const date = new Date(session.started_at);
            const dayName = dayNames[date.getDay()];
            sessionsByDay[dayName]++;
          }
        });

        const chartData = dayNames.map((day) => ({
          day,
          sessions: sessionsByDay[day],
        }));

        setWeekData(chartData);
      } catch (err) {
        console.error('Error fetching week data:', err);
      } finally {
        setLoadingWeekData(false);
      }
    };

    fetchWeekData();
  }, [user?.id]);

  // Fetch recent sessions
  useEffect(() => {
    if (!user?.id) return;

    const fetchRecentSessions = async () => {
      try {
        setLoadingRecentSessions(true);
        const { data, error } = await supabase
          .from('sessions')
          .select('id, host_id, partner_id, duration, ended_at, status')
          .or(`host_id.eq.${user.id},partner_id.eq.${user.id}`)
          .eq('status', 'completed')
          .order('ended_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        // Fetch partner names
        if (data) {
          const sessionsWithNames = await Promise.all(
            data.map(async (session) => {
              const partnerId = session.host_id === user.id ? session.partner_id : session.host_id;
              const { data: partnerData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', partnerId)
                .single();

              return {
                id: session.id,
                partner_name: partnerData?.full_name || 'Unknown',
                duration: session.duration,
                ended_at: session.ended_at,
                status: session.status,
              };
            })
          );

          setRecentSessions(sessionsWithNames);
        }
      } catch (err) {
        console.error('Error fetching recent sessions:', err);
      } finally {
        setLoadingRecentSessions(false);
      }
    };

    fetchRecentSessions();
  }, [user?.id]);

  // Fetch partners count and community data
  useEffect(() => {
    if (!user?.id) return;

    const fetchCommunityData = async () => {
      try {
        setLoadingCommunity(true);

        // Count distinct partners
        const { data: partnersData, error: partnersError } = await supabase
          .from('sessions')
          .select('partner_id, host_id')
          .or(`host_id.eq.${user.id},partner_id.eq.${user.id}`)
          .eq('status', 'completed');

        if (partnersError) throw partnersError;

        if (partnersData) {
          const uniquePartners = new Set<string>();
          partnersData.forEach((session) => {
            if (session.host_id === user.id) {
              uniquePartners.add(session.partner_id);
            } else {
              uniquePartners.add(session.host_id);
            }
          });
          setPartnersCount(uniquePartners.size);
        }

        // Count total profiles
        const { count: totalCount, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        setTotalProfiles(totalCount || 0);

        // Count sessions completed today
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount, error: todayError } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('ended_at', `${today}T00:00:00`)
          .lt('ended_at', `${today}T23:59:59`);

        if (todayError) throw todayError;
        setSessionsToday(todayCount || 0);

        // Fetch top leaderboard (users by total_hours)
        const { data: leaderboardRaw, error: leaderboardError } = await supabase
          .from('profiles')
          .select('full_name, city, total_hours')
          .order('total_hours', { ascending: false })
          .limit(3);

        if (leaderboardError) throw leaderboardError;

        const leaderboard = leaderboardRaw?.map((user, index) => ({
          rank: index + 1,
          name: user.full_name,
          hours: user.total_hours,
          location: user.city,
        })) || [];

        setLeaderboardData(leaderboard);
      } catch (err) {
        console.error('Error fetching community data:', err);
      } finally {
        setLoadingCommunity(false);
      }
    };

    fetchCommunityData();
  }, [user?.id]);

  // Format time until next session
  const getTimeUntil = (scheduledAt: string): string => {
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    const diffMs = sessionTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return 'Past';
    if (diffMins < 60) return `${diffMins} minutes`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours`;
    return `${Math.floor(diffHours / 24)} days`;
  };

  // Format session date for display
  const formatSessionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[#9E9E9E]">
            Good morning, {loadingProfile ? '...' : profile?.full_name || 'Warrior'}
          </p>
        </div>
        <Link
          href="/dashboard/book"
          className="bg-[#F9A825] hover:bg-[#E89B1F] text-[#0A0A0A] font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <span>Activate War Mode</span>
          <span>⚔️</span>
        </Link>
      </div>

      {/* STAT CARDS - 4 in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Day Streak */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Day Streak</p>
          <p className="text-3xl font-bold text-[#F9A825]">
            {loadingProfile ? '-' : profile?.streak_current || 0}
          </p>
          <p className="text-xs text-[#616161] mt-3">Days in a row</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⚔️</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-white">
            {loadingProfile ? '-' : profile?.total_sessions || 0}
          </p>
          <p className="text-xs text-[#616161] mt-3">All time</p>
        </div>

        {/* Hours Focused */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Hours Focused</p>
          <p className="text-3xl font-bold text-white">
            {loadingProfile ? '-' : (profile?.total_hours || 0).toFixed(1)}h
          </p>
          <p className="text-xs text-[#616161] mt-3">All time</p>
        </div>

        {/* Partners Met */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Partners Met</p>
          <p className="text-3xl font-bold text-white">
            {loadingCommunity ? '-' : partnersCount}
          </p>
          <p className="text-xs text-[#616161] mt-3">Unique warriors</p>
        </div>
      </div>

      {/* 2x2 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* NEXT SESSION CARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Next Session</h2>

          {loadingNextSession ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#9E9E9E]">Loading...</div>
            </div>
          ) : nextSession && nextSessionPartner ? (
            <div className="space-y-5">
              {/* Partner Info */}
              <div className="flex items-center gap-4 pb-5 border-b border-[#2A2A2A]">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-[#0A0A0A]">
                    {getInitials(nextSessionPartner.full_name)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{nextSessionPartner.full_name}</p>
                  <p className="text-sm text-[#9E9E9E]">
                    {nextSessionPartner.role || 'Warrior'} • {nextSessionPartner.city || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Time Info */}
              <div>
                <p className="text-sm text-[#9E9E9E] mb-2">Starting in</p>
                <p className="text-2xl font-bold text-[#F9A825]">{getTimeUntil(nextSession.scheduled_at)}</p>
              </div>

              {/* Session Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9E9E9E]">Session Type</span>
                  <span className="text-sm font-medium text-white">
                    {nextSession.mode === 'video' ? '📹 Video' : nextSession.mode === 'audio' ? '🎙️ Audio' : '📝 Text'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9E9E9E]">Duration</span>
                  <span className="text-sm font-medium text-white">{nextSession.duration} minutes</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 bg-[#F9A825] hover:bg-[#E89B1F] text-[#0A0A0A] font-semibold py-3 rounded-lg transition-all duration-200">
                Join Now
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#9E9E9E]">No sessions yet</div>
            </div>
          )}
        </div>

        {/* THIS WEEK CHART */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">This Week</h2>

          {loadingWeekData ? (
            <div className="flex items-center justify-center h-72">
              <div className="text-[#9E9E9E]">Loading...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="day"
                  stroke="#616161"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#616161" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F9A825' }}
                />
                <Bar
                  dataKey="sessions"
                  fill="#F9A825"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* COMMUNITY CARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Community</h2>

          {loadingCommunity ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-[#9E9E9E]">Loading...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#2A2A2A]">
                <div className="bg-[#0A0A0A] rounded-lg p-4">
                  <p className="text-sm text-[#9E9E9E] mb-1">Warriors Online</p>
                  <p className="text-2xl font-bold text-[#F9A825]">{totalProfiles.toLocaleString()}</p>
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-4">
                  <p className="text-sm text-[#9E9E9E] mb-1">Sessions Today</p>
                  <p className="text-2xl font-bold text-white">{sessionsToday.toLocaleString()}</p>
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <p className="text-sm font-semibold text-white mb-4">
                  Top Warriors
                </p>
                {leaderboardData.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboardData.map((leader) => (
                      <div
                        key={leader.rank}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#F9A825] w-6">
                            {leader.rank}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {leader.name}
                            </p>
                            <p className="text-xs text-[#616161]">
                              {leader.location}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#F9A825]">
                          {leader.hours.toFixed(1)}h
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[#9E9E9E] text-sm">No data yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RECENT SESSIONS */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Recent Sessions
          </h2>

          {loadingRecentSessions ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#9E9E9E]">Loading...</div>
            </div>
          ) : recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {session.partner_name}
                    </p>
                    <p className="text-xs text-[#616161]">{formatSessionDate(session.ended_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#9E9E9E]">
                      {session.duration} min
                    </p>
                    <p className="text-xs text-[#4CAF50]">✓ {session.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#9E9E9E]">No sessions yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
