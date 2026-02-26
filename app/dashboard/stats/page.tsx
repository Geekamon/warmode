'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Profile {
  total_sessions: number;
  total_hours: number;
  streak_best: number;
  streak_current: number;
}

interface SessionData {
  id: string;
  host_id: string;
  partner_id: string;
  duration: number;
  started_at: string | null;
}

export default function StatsPage() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uniquePartners, setUniquePartners] = useState(0);
  const [avgCompletionRate, setAvgCompletionRate] = useState(0);
  const [monthData, setMonthData] = useState<Array<{ day: string; sessions: number }>>([]);
  const [sessionBreakdown, setSessionBreakdown] = useState<
    Array<{ duration: string; percentage: number; color: string }>
  >([]);
  const [peakHours, setPeakHours] = useState<Array<{ hour: string; sessions: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Fetch profile stats
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_sessions, total_hours, streak_best, streak_current')
        .eq('id', userId)
        .single();

      setProfile(profileData);

      // Fetch all sessions
      const { data: userSessions } = await supabase
        .from('sessions')
        .select('id, host_id, partner_id, duration, started_at, status')
        .or(`host_id.eq.${userId},partner_id.eq.${userId}`)
        .eq('status', 'completed');

      if (!userSessions) {
        setLoading(false);
        return;
      }

      // Count unique partners
      const uniquePartnerSet = new Set<string>();
      userSessions.forEach((s) => {
        const partnerId = s.host_id === userId ? s.partner_id : s.host_id;
        uniquePartnerSet.add(partnerId);
      });
      setUniquePartners(uniquePartnerSet.size);

      // Calculate completion rate
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('status')
        .or(`host_id.eq.${userId},partner_id.eq.${userId}`);

      const completedCount = (allSessions || []).filter(
        (s) => s.status === 'completed'
      ).length;
      const totalCount = (allSessions || []).length;
      const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      setAvgCompletionRate(rate);

      // Process monthly data
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const monthlyMap: Record<number, number> = {};
      userSessions.forEach((s) => {
        if (s.started_at) {
          const date = new Date(s.started_at);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const day = date.getDate();
            monthlyMap[day] = (monthlyMap[day] || 0) + 1;
          }
        }
      });

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const monthArray = Array.from({ length: daysInMonth }, (_, i) => ({
        day: `${i + 1}`,
        sessions: monthlyMap[i + 1] || 0,
      }));
      setMonthData(monthArray);

      // Process session breakdown
      const durationMap: Record<number, number> = {};
      userSessions.forEach((s) => {
        durationMap[s.duration] = (durationMap[s.duration] || 0) + 1;
      });

      const totalSessions = userSessions.length;
      const breakdown = [
        {
          duration: '25 min',
          count: durationMap[25] || 0,
          color: '#4CAF50',
        },
        {
          duration: '50 min',
          count: durationMap[50] || 0,
          color: '#F9A825',
        },
        {
          duration: '75 min',
          count: durationMap[75] || 0,
          color: '#1B5E20',
        },
      ].map((item) => ({
        duration: item.duration,
        percentage: totalSessions > 0 ? Math.round((item.count / totalSessions) * 100) : 0,
        color: item.color,
      }));
      setSessionBreakdown(breakdown);

      // Process peak hours
      const hourMap: Record<number, number> = {};
      userSessions.forEach((s) => {
        if (s.started_at) {
          const date = new Date(s.started_at);
          const hour = date.getHours();
          hourMap[hour] = (hourMap[hour] || 0) + 1;
        }
      });

      const peakHoursArray = [
        { hour: '6-7 AM', hourKey: 6 },
        { hour: '12-1 PM', hourKey: 12 },
        { hour: '6-7 PM', hourKey: 18 },
        { hour: '8-9 PM', hourKey: 20 },
      ].map((item) => ({
        hour: item.hour,
        sessions: hourMap[item.hourKey] || 0,
      }));
      setPeakHours(peakHoursArray);

      setLoading(false);
    };

    fetchStats();
  }, [userId]);
  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen p-8 flex items-center justify-center">
        <p className="text-[#9E9E9E]">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-[#9E9E9E]">Your performance metrics and progress</p>
      </div>

      {/* 5 STAT CARDS IN A ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Sessions */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⚔️</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Total Sessions</p>
          <p className="text-3xl font-bold text-white">
            {profile?.total_sessions || 0}
          </p>
        </div>

        {/* Hours Focused */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Hours Focused</p>
          <p className="text-3xl font-bold text-white">
            {profile?.total_hours || 0}h
          </p>
        </div>

        {/* Best Streak */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Best Streak</p>
          <p className="text-3xl font-bold text-[#F9A825]">
            {profile?.streak_best || 0} days
          </p>
        </div>

        {/* Unique Partners */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Unique Partners</p>
          <p className="text-3xl font-bold text-white">{uniquePartners}</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Completion Rate</p>
          <p className="text-3xl font-bold text-[#4CAF50]">{avgCompletionRate}%</p>
        </div>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MONTHLY SESSIONS CHART */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            {monthData.length > 0 ? 'This Month Sessions' : 'No data yet'}
          </h2>

          {monthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="day"
                  stroke="#616161"
                  style={{ fontSize: '10px' }}
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
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-[#9E9E9E]">No session data yet</p>
            </div>
          )}
        </div>

        {/* SESSION BREAKDOWN & PEAK HOURS */}
        <div className="space-y-6">
          {/* SESSION BREAKDOWN */}
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              {sessionBreakdown.length > 0 ? 'Session Breakdown' : 'No data yet'}
            </h2>

            {sessionBreakdown.length > 0 ? (
              <div className="space-y-5">
                {sessionBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#9E9E9E]">{item.duration}</span>
                      <span className="text-sm font-semibold text-white">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0A0A] rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#9E9E9E] text-center py-8">
                No session data yet
              </p>
            )}
          </div>

          {/* PEAK HOURS */}
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              {peakHours.some((h) => h.sessions > 0) ? 'Peak Hours' : 'No data yet'}
            </h2>

            {peakHours.some((h) => h.sessions > 0) ? (
              <div className="space-y-4">
                {peakHours.map((item, index) => {
                  const maxSessions = Math.max(...peakHours.map((h) => h.sessions), 1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-b-0"
                    >
                      <span className="text-sm text-[#9E9E9E]">{item.hour}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-[#0A0A0A] rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#F9A825]"
                            style={{
                              width: `${(item.sessions / maxSessions) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-8 text-right">
                          {item.sessions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#9E9E9E] text-center py-8">
                No session data yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
