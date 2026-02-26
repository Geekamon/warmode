'use client';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weekData = [
  { day: 'Mon', sessions: 3 },
  { day: 'Tue', sessions: 5 },
  { day: 'Wed', sessions: 2 },
  { day: 'Thu', sessions: 6 },
  { day: 'Fri', sessions: 4 },
  { day: 'Sat', sessions: 7 },
  { day: 'Sun', sessions: 2 },
];

const leaderboardData = [
  { rank: 1, name: 'Chioma D.', hours: 156.5, location: 'Lagos' },
  { rank: 2, name: 'Tunde M.', hours: 142.3, location: 'Abuja' },
  { rank: 3, name: 'Blessing O.', hours: 138.1, location: 'Portharcourt' },
];

const recentSessions = [
  {
    id: 1,
    partner: 'Chidi Nwosu',
    date: 'Today, 10:30 AM',
    duration: '50 min',
    status: 'completed',
  },
  {
    id: 2,
    partner: 'Toke Oyedele',
    date: 'Yesterday, 2:15 PM',
    duration: '45 min',
    status: 'completed',
  },
  {
    id: 3,
    partner: 'Kola Adeyemi',
    date: 'Feb 23, 11:00 AM',
    duration: '60 min',
    status: 'completed',
  },
  {
    id: 4,
    partner: 'Zainab Hassan',
    date: 'Feb 22, 3:45 PM',
    duration: '50 min',
    status: 'completed',
  },
];

export default function DashboardPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[#9E9E9E]">Good morning, Adaeze</p>
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
          <p className="text-3xl font-bold text-[#F9A825]">7</p>
          <p className="text-xs text-[#616161] mt-3">Days in a row</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⚔️</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-white">47</p>
          <p className="text-xs text-[#616161] mt-3">All time</p>
        </div>

        {/* Hours Focused */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Hours Focused</p>
          <p className="text-3xl font-bold text-white">38.5h</p>
          <p className="text-xs text-[#616161] mt-3">This month</p>
        </div>

        {/* Partners Met */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-1">Partners Met</p>
          <p className="text-3xl font-bold text-white">23</p>
          <p className="text-xs text-[#616161] mt-3">Unique warriors</p>
        </div>
      </div>

      {/* 2x2 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* NEXT SESSION CARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Next Session</h2>

          <div className="space-y-5">
            {/* Partner Info */}
            <div className="flex items-center gap-4 pb-5 border-b border-[#2A2A2A]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-[#0A0A0A]">CN</span>
              </div>
              <div>
                <p className="font-semibold text-white">Chidi Nwosu</p>
                <p className="text-sm text-[#9E9E9E]">Developer • Lagos</p>
              </div>
            </div>

            {/* Time Info */}
            <div>
              <p className="text-sm text-[#9E9E9E] mb-2">Starting in</p>
              <p className="text-2xl font-bold text-[#F9A825]">23 minutes</p>
            </div>

            {/* Session Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9E9E9E]">Session Type</span>
                <span className="text-sm font-medium text-white">📹 Video</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9E9E9E]">Duration</span>
                <span className="text-sm font-medium text-white">50 minutes</span>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full mt-4 bg-[#F9A825] hover:bg-[#E89B1F] text-[#0A0A0A] font-semibold py-3 rounded-lg transition-all duration-200">
              Join Now
            </button>
          </div>
        </div>

        {/* THIS WEEK CHART */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">This Week</h2>

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
        </div>

        {/* COMMUNITY CARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Community</h2>

          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#2A2A2A]">
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <p className="text-sm text-[#9E9E9E] mb-1">Warriors Online</p>
                <p className="text-2xl font-bold text-[#F9A825]">1,247</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <p className="text-sm text-[#9E9E9E] mb-1">Sessions Today</p>
                <p className="text-2xl font-bold text-white">3,891</p>
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <p className="text-sm font-semibold text-white mb-4">
                Top Warriors
              </p>
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
                      {leader.hours}h
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RECENT SESSIONS */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Recent Sessions
          </h2>

          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {session.partner}
                  </p>
                  <p className="text-xs text-[#616161]">{session.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#9E9E9E]">
                    {session.duration}
                  </p>
                  <p className="text-xs text-[#4CAF50]">✓ {session.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
