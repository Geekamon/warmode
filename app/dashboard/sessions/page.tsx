'use client';

import { useState } from 'react';

const sessions = [
  {
    id: 1,
    partner: 'Chidi Nwosu',
    avatar: 'CN',
    date: 'Feb 25, 10:30 AM',
    duration: '50 min',
    mode: '📹',
    status: 'completed',
  },
  {
    id: 2,
    partner: 'Toke Oyedele',
    avatar: 'TO',
    date: 'Feb 24, 2:15 PM',
    duration: '45 min',
    mode: '🎙',
    status: 'completed',
  },
  {
    id: 3,
    partner: 'Kola Adeyemi',
    avatar: 'KA',
    date: 'Feb 23, 11:00 AM',
    duration: '60 min',
    mode: '📹',
    status: 'completed',
  },
  {
    id: 4,
    partner: 'Zainab Hassan',
    avatar: 'ZH',
    date: 'Feb 22, 3:45 PM',
    duration: '50 min',
    mode: '📹',
    status: 'completed',
  },
  {
    id: 5,
    partner: 'Blessing Okafor',
    avatar: 'BO',
    date: 'Feb 28, 9:00 AM',
    duration: '75 min',
    mode: '🎙',
    status: 'upcoming',
  },
  {
    id: 6,
    partner: 'Tunde Afolayan',
    avatar: 'TA',
    date: 'Mar 2, 4:00 PM',
    duration: '50 min',
    mode: '📹',
    status: 'upcoming',
  },
  {
    id: 7,
    partner: 'Ada Okoro',
    avatar: 'AO',
    date: 'Mar 5, 2:30 PM',
    duration: '60 min',
    mode: '📹',
    status: 'upcoming',
  },
];

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Completed', value: 'completed' },
  { label: 'Upcoming', value: 'upcoming' },
];

export default function SessionsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'completed') return session.status === 'completed';
    if (activeFilter === 'upcoming') return session.status === 'upcoming';
    return true;
  });

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Sessions</h1>
        <p className="text-[#9E9E9E]">Track all your focus sessions</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 mb-8 border-b border-[#2A2A2A] pb-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === tab.value
                ? 'bg-[#F9A825] text-[#0A0A0A]'
                : 'text-[#9E9E9E] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SESSIONS TABLE */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#0A0A0A] border-b border-[#2A2A2A]">
          <div className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">
            Partner
          </div>
          <div className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">
            Date
          </div>
          <div className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">
            Duration
          </div>
          <div className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide">
            Mode
          </div>
          <div className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide col-span-2">
            Status
          </div>
        </div>

        {/* TABLE ROWS */}
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-[#2A2A2A] last:border-b-0 hover:bg-[#252525] transition-colors items-center"
          >
            {/* Partner */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F9A825] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-[#0A0A0A]">
                  {session.avatar}
                </span>
              </div>
              <span className="text-sm font-medium text-white truncate">
                {session.partner}
              </span>
            </div>

            {/* Date */}
            <span className="text-sm text-[#9E9E9E]">{session.date}</span>

            {/* Duration */}
            <span className="text-sm font-medium text-white">{session.duration}</span>

            {/* Mode */}
            <span className="text-lg">{session.mode}</span>

            {/* Status */}
            <div className="col-span-2">
              {session.status === 'completed' ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4CAF50]">
                  <span>✓</span> Done
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F9A825] text-[#0A0A0A]">
                  Upcoming
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredSessions.length === 0 && (
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-12 text-center">
          <p className="text-[#9E9E9E]">No sessions found for this filter</p>
        </div>
      )}
    </div>
  );
}
