'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const DURATIONS = [
  { value: 25, label: 'Quick Sprint', description: '25 min' },
  { value: 50, label: 'Deep Work', description: '50 min' },
  { value: 75, label: 'Marathon', description: '75 min' },
];

const SESSION_MODES = [
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
];

const MATCH_PREFERENCES = [
  { value: 'anyone', label: 'Anyone' },
  { value: 'city', label: 'Same City' },
  { value: 'role', label: 'Same Role' },
  { value: 'favorite', label: 'Favorites' },
];

// Generate time slots from a start hour, every 30 min
function generateTimeSlots(startDate: Date, isToday: boolean): string[] {
  const slots: string[] = [];
  const now = new Date();

  let startHour = 6; // earliest slot: 6 AM
  let startMin = 0;

  if (isToday) {
    // Round up to next 30-min mark
    startHour = now.getHours();
    startMin = now.getMinutes();
    if (startMin > 0 && startMin <= 30) {
      startMin = 30;
    } else if (startMin > 30) {
      startHour += 1;
      startMin = 0;
    }
    // If it's past 11:30 PM, no more slots today
    if (startHour >= 24) return [];
  }

  for (let h = startHour; h < 24; h++) {
    for (let m = (h === startHour ? startMin : 0); m < 60; m += 30) {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      const minStr = m === 0 ? '00' : '30';
      slots.push(`${hour12}:${minStr} ${ampm}`);
    }
    if (slots.length >= 12) break; // max 12 slots shown
  }

  return slots;
}

// Generate next 4 days starting from today
function generateDateOptions(): { value: string; label: string; date: Date }[] {
  const options: { value: string; label: string; date: Date }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);

    let label: string;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else label = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;

    options.push({
      value: i === 0 ? 'today' : d.toISOString().split('T')[0],
      label,
      date: d,
    });
  }

  return options;
}

interface OpenSession {
  id: string;
  host_id: string;
  duration: number;
  mode: string;
  match_type: string;
  scheduled_at: string;
  host_name: string;
  host_city: string;
  host_goal: string | null;
}

export default function BookPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [duration, setDuration] = useState(50);
  const [sessionMode, setSessionMode] = useState('video');
  const [matchPreference, setMatchPreference] = useState('anyone');
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState('Now');
  const [goal, setGoal] = useState('');
  const [openSessions, setOpenSessions] = useState<OpenSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const dateOptions = useMemo(() => generateDateOptions(), []);

  const timeSlots = useMemo(() => {
    const isToday = selectedDateIdx === 0;
    const slots = generateTimeSlots(dateOptions[selectedDateIdx].date, isToday);
    return ['Now', ...slots];
  }, [selectedDateIdx, dateOptions]);

  // Reset time selection when date changes
  useEffect(() => {
    setSelectedTime(selectedDateIdx === 0 ? 'Now' : timeSlots[1] || 'Now');
  }, [selectedDateIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch open sessions waiting for partners
  useEffect(() => {
    if (!user?.id) return;

    const fetchOpenSessions = async () => {
      setLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, host_id, duration, mode, match_type, scheduled_at, host_goal')
          .eq('status', 'open')
          .neq('host_id', user.id)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          // Batch fetch host profiles
          const hostIds = [...new Set(data.map((s) => s.host_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, city')
            .in('id', hostIds);

          const profileMap = (profiles || []).reduce(
            (map: Record<string, { name: string; city: string }>, p) => {
              map[p.id] = { name: p.full_name, city: p.city || '' };
              return map;
            },
            {}
          );

          setOpenSessions(
            data.map((s) => ({
              ...s,
              host_name: profileMap[s.host_id]?.name || 'Warrior',
              host_city: profileMap[s.host_id]?.city || '',
            }))
          );
        } else {
          setOpenSessions([]);
        }
      } catch {
        setOpenSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchOpenSessions();

    // Refresh every 15 seconds
    const interval = setInterval(fetchOpenSessions, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const selectedDate = dateOptions[selectedDateIdx].value;

  const handleActivateWar = () => {
    const goalParam = goal.trim() ? `&goal=${encodeURIComponent(goal.trim())}` : '';
    const timeParam = selectedTime !== 'Now' ? `&time=${encodeURIComponent(selectedTime)}&date=${selectedDate}` : '';
    router.push(`/dashboard/book/matching?duration=${duration}&mode=${sessionMode}&match=${matchPreference}${goalParam}${timeParam}`);
  };

  const handleJoinSession = (sessionId: string) => {
    router.push(`/dashboard/book/matching?join=${sessionId}`);
  };

  const getTimeAgo = (scheduledAt: string) => {
    const diff = new Date(scheduledAt).getTime() - Date.now();
    if (diff < 0) return 'Now';
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `in ${hrs}h ${mins % 60}m`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Book Your War Mode Session</h1>
          <p className="text-[#9E9E9E] text-sm md:text-base">Choose your settings and find a partner to build with</p>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Duration Picker */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Session Duration</h2>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => setDuration(dur.value)}
                    className={`p-4 md:p-6 rounded-lg border-2 transition-all duration-200 ${
                      duration === dur.value
                        ? 'border-[#F9A825] bg-[#F9A825] bg-opacity-10'
                        : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#F9A825]'
                    }`}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{dur.value}</div>
                    <div className="text-[#F9A825] font-semibold text-xs md:text-sm">{dur.label}</div>
                    <div className="text-[#9E9E9E] text-xs mt-1">{dur.description}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Session Mode */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Session Mode</h2>
              <div className="flex gap-4">
                {SESSION_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setSessionMode(mode.value)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 font-semibold ${
                      sessionMode === mode.value
                        ? 'border-[#F9A825] bg-[#F9A825] bg-opacity-10 text-[#F9A825]'
                        : 'border-[#2A2A2A] bg-[#1E1E1E] text-white hover:border-[#F9A825]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Match Preference */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Match Preference</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MATCH_PREFERENCES.map((pref) => (
                  <button
                    key={pref.value}
                    onClick={() => setMatchPreference(pref.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium text-center ${
                      matchPreference === pref.value
                        ? 'border-[#F9A825] bg-[#F9A825] bg-opacity-10 text-[#F9A825]'
                        : 'border-[#2A2A2A] bg-[#1E1E1E] text-white hover:border-[#F9A825]'
                    }`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Session Goal */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">What are you working on?</h2>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Finishing my portfolio website, Studying for exams..."
                maxLength={120}
                className="w-full p-4 rounded-lg border-2 border-[#2A2A2A] bg-[#1E1E1E] text-white placeholder-[#616161] focus:border-[#F9A825] focus:outline-none transition-all duration-200"
              />
              <p className="text-xs text-[#616161] mt-2">{goal.length}/120 — Your partner will see this</p>
            </section>

            {/* Time Selection */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Select Time</h2>

              {/* Date Tabs */}
              <div className="flex gap-1 mb-4 border-b border-[#2A2A2A] overflow-x-auto">
                {dateOptions.map((date, idx) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDateIdx(idx)}
                    className={`px-3 md:px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
                      selectedDateIdx === idx
                        ? 'border-[#F9A825] text-[#F9A825]'
                        : 'border-transparent text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      selectedTime === time
                        ? 'border-[#F9A825] bg-[#F9A825] bg-opacity-10 text-[#F9A825]'
                        : 'border-[#2A2A2A] bg-[#1E1E1E] text-white hover:border-[#F9A825]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
                {timeSlots.length <= 1 && selectedDateIdx === 0 && (
                  <p className="col-span-full text-[#9E9E9E] text-sm text-center py-4">
                    No more slots today. Try tomorrow!
                  </p>
                )}
              </div>
            </section>

            {/* Open Sessions — Warriors Waiting */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Warriors Ready to Match</h2>
              <p className="text-[#9E9E9E] text-sm mb-4">Jump into a session with someone already waiting</p>

              {loadingSessions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-[#1E1E1E] rounded-lg animate-pulse border border-[#2A2A2A]" />
                  ))}
                </div>
              ) : openSessions.length === 0 ? (
                <div className="text-center py-8 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A]">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-[#9E9E9E] text-sm">No one waiting right now. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {openSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#0A0A0A]">
                            {session.host_name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm truncate">{session.host_name}</span>
                            {session.host_city && (
                              <span className="text-xs text-[#9E9E9E]">{session.host_city}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#F9A825]">
                              {session.duration}min
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#9E9E9E] capitalize">
                              {session.mode}
                            </span>
                            <span className="text-xs text-[#9E9E9E]">
                              {getTimeAgo(session.scheduled_at)}
                            </span>
                          </div>
                          {session.host_goal && (
                            <p className="text-xs text-[#9E9E9E] mt-1 truncate">
                              &ldquo;{session.host_goal}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinSession(session.id)}
                        className="ml-3 px-4 py-2 bg-[#F9A825] text-[#0A0A0A] font-bold text-xs rounded-lg hover:bg-[#F9B840] transition-colors flex-shrink-0"
                      >
                        JOIN
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN - Summary Panel */}
          <div className="col-span-1">
            <div className="sticky top-6 p-6 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] lg:top-6 top-auto">
              <h3 className="text-lg font-bold text-white mb-6">Session Summary</h3>

              <div className="space-y-6 mb-6">
                {/* Duration Summary */}
                <div>
                  <p className="text-[#9E9E9E] text-sm mb-2">Duration</p>
                  <p className="text-xl font-bold text-white">
                    {duration} minutes
                  </p>
                  <p className="text-[#F9A825] text-sm mt-1">
                    {DURATIONS.find((d) => d.value === duration)?.label}
                  </p>
                </div>

                {/* Session Mode Summary */}
                <div>
                  <p className="text-[#9E9E9E] text-sm mb-2">Mode</p>
                  <p className="text-xl font-bold text-white capitalize">
                    {sessionMode}
                  </p>
                </div>

                {/* Match Summary */}
                <div>
                  <p className="text-[#9E9E9E] text-sm mb-2">Matching</p>
                  <p className="text-xl font-bold text-white">
                    {MATCH_PREFERENCES.find((p) => p.value === matchPreference)?.label}
                  </p>
                </div>

                {/* Goal Summary */}
                {goal.trim() && (
                  <div>
                    <p className="text-[#9E9E9E] text-sm mb-2">Goal</p>
                    <p className="text-sm font-medium text-white break-words">
                      {goal.trim()}
                    </p>
                  </div>
                )}

                {/* Time Summary */}
                <div>
                  <p className="text-[#9E9E9E] text-sm mb-2">Time</p>
                  <p className="text-xl font-bold text-white">
                    {selectedTime}
                  </p>
                  <p className="text-[#9E9E9E] text-sm mt-1">
                    {dateOptions[selectedDateIdx].label}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#2A2A2A] my-6" />

              {/* Main CTA Button */}
              <button
                onClick={handleActivateWar}
                className="w-full bg-[#F9A825] text-[#0A0A0A] font-bold py-4 rounded-lg hover:bg-[#F9B840] transition-all duration-200 text-lg mb-3 flex items-center justify-center gap-2"
              >
                ACTIVATE WAR MODE
              </button>

              <p className="text-[#9E9E9E] text-xs text-center">
                You&apos;ll be matched with a partner within seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
