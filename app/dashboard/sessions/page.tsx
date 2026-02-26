'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Upcoming', value: 'upcoming' },
];

interface Session {
  id: string;
  host_id: string;
  partner_id: string;
  duration: number;
  mode: string;
  status: 'open' | 'matched' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  ended_at: string | null;
  scheduled_at: string | null;
  partner_name: string;
  partner_avatar: string;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [activeFilter, setActiveFilter] = useState('all');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!userId) return;

      const { data: userSessions, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`host_id.eq.${userId},partner_id.eq.${userId}`)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        setLoading(false);
        return;
      }

      // Fetch partner profiles
      const sessionIds = userSessions.map((s) => s.id);
      if (sessionIds.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const partnerIds = userSessions.map((s) =>
        s.host_id === userId ? s.partner_id : s.host_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', partnerIds);

      const profileMap = (profiles || []).reduce(
        (map, p) => {
          map[p.id] = p.full_name;
          return map;
        },
        {} as Record<string, string>
      );

      const enrichedSessions: Session[] = userSessions.map((s) => {
        const partnerId = s.host_id === userId ? s.partner_id : s.host_id;
        const partnerName = profileMap[partnerId] || 'Unknown Partner';
        const avatar = partnerName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase();

        return {
          ...s,
          partner_name: partnerName,
          partner_avatar: avatar,
        };
      });

      setSessions(enrichedSessions);
      setLoading(false);
    };

    fetchSessions();
  }, [userId]);

  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'completed') return session.status === 'completed';
    if (activeFilter === 'upcoming')
      return session.status === 'open' || session.status === 'matched';
    return true;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModeEmoji = (mode: string) => {
    if (mode === 'video') return '📹';
    if (mode === 'audio') return '🎙';
    return '💬';
  };

  const getStatusDisplay = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4CAF50]">
          <span>✓</span> Done
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F9A825] text-[#0A0A0A]">
        Upcoming
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen p-8 flex items-center justify-center">
        <p className="text-[#9E9E9E]">Loading sessions...</p>
      </div>
    );
  }

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

      {/* SESSIONS TABLE OR EMPTY STATE */}
      {filteredSessions.length > 0 ? (
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
                    {session.partner_avatar}
                  </span>
                </div>
                <span className="text-sm font-medium text-white truncate">
                  {session.partner_name}
                </span>
              </div>

              {/* Date */}
              <span className="text-sm text-[#9E9E9E]">
                {formatDate(session.scheduled_at || session.started_at)}
              </span>

              {/* Duration */}
              <span className="text-sm font-medium text-white">
                {session.duration} min
              </span>

              {/* Mode */}
              <span className="text-lg">{getModeEmoji(session.mode)}</span>

              {/* Status */}
              <div className="col-span-2">{getStatusDisplay(session.status)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-12 text-center">
          <p className="text-[#9E9E9E]">
            No sessions yet — book your first session!
          </p>
        </div>
      )}
    </div>
  );
}
