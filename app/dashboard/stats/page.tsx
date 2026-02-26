'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthData = Array.from({ length: 25 }, (_, i) => ({
  day: `${i + 1}`,
  sessions: Math.floor(Math.random() * 8) + 2,
}));

const sessionBreakdown = [
  { duration: '50 min', percentage: 60, color: '#F9A825' },
  { duration: '25 min', percentage: 25, color: '#4CAF50' },
  { duration: '75 min', percentage: 15, color: '#1B5E20' },
];

const peakHours = [
  { hour: '6-7 AM', sessions: 12 },
  { hour: '12-1 PM', sessions: 28 },
  { hour: '6-7 PM', sessions: 35 },
  { hour: '8-9 PM', sessions: 22 },
];

export default function StatsPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-[#9E9E9E]">Your performance metrics and progress</p>
      </div>

      {/* 5 STAT CARDS IN A ROW */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {/* Total Sessions */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⚔️</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Total Sessions</p>
          <p className="text-3xl font-bold text-white">47</p>
        </div>

        {/* Hours Focused */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Hours Focused</p>
          <p className="text-3xl font-bold text-white">38.5h</p>
        </div>

        {/* Best Streak */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Best Streak</p>
          <p className="text-3xl font-bold text-[#F9A825]">14 days</p>
        </div>

        {/* Unique Partners */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Unique Partners</p>
          <p className="text-3xl font-bold text-white">23</p>
        </div>

        {/* Avg Focus Score */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-[#9E9E9E] text-xs mb-2">Avg Focus Score</p>
          <p className="text-3xl font-bold text-[#4CAF50]">94%</p>
        </div>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="grid grid-cols-2 gap-6">
        {/* MONTHLY SESSIONS CHART */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">February Sessions</h2>

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
        </div>

        {/* SESSION BREAKDOWN & PEAK HOURS */}
        <div className="space-y-6">
          {/* SESSION BREAKDOWN */}
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Session Breakdown
            </h2>

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
          </div>

          {/* PEAK HOURS */}
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Peak Hours</h2>

            <div className="space-y-4">
              {peakHours.map((item, index) => (
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
                          width: `${(item.sessions / 35) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-8 text-right">
                      {item.sessions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
