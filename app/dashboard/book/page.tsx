'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  { value: 'same-city', label: 'Same City' },
  { value: 'same-role', label: 'Same Role' },
  { value: 'favorites', label: 'Favorites' },
];

const TIME_SLOTS = [
  'Now',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
];

export default function BookPage() {
  const router = useRouter();
  const [duration, setDuration] = useState(50);
  const [sessionMode, setSessionMode] = useState('video');
  const [matchPreference, setMatchPreference] = useState('anyone');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedTime, setSelectedTime] = useState('Now');
  const [goal, setGoal] = useState('');

  const handleActivateWar = () => {
    const goalParam = goal.trim() ? `&goal=${encodeURIComponent(goal.trim())}` : '';
    router.push(`/dashboard/book/matching?duration=${duration}&mode=${sessionMode}&match=${matchPreference}${goalParam}`);
  };

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'wed', label: 'Wed' },
    { value: 'thu', label: 'Thu' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Book Your War Mode Session</h1>
          <p className="text-[#9E9E9E]">Choose your settings and find a partner to build with</p>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Duration Picker */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Session Duration</h2>
              <div className="grid grid-cols-3 gap-4">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => setDuration(dur.value)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                      duration === dur.value
                        ? 'border-[#F9A825] bg-rgba(249,168,37,0.15)'
                        : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#F9A825]'
                    }`}
                  >
                    <div className="text-3xl font-bold text-white mb-2">{dur.value}</div>
                    <div className="text-[#F9A825] font-semibold text-sm">{dur.label}</div>
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
                        ? 'border-[#F9A825] bg-rgba(249,168,37,0.15) text-[#F9A825]'
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
              <div className="space-y-2">
                {MATCH_PREFERENCES.map((pref) => (
                  <button
                    key={pref.value}
                    onClick={() => setMatchPreference(pref.value)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                      matchPreference === pref.value
                        ? 'border-[#F9A825] bg-rgba(249,168,37,0.15) text-[#F9A825]'
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
              <div className="flex gap-2 mb-4 border-b border-[#2A2A2A]">
                {dateOptions.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
                      selectedDate === date.value
                        ? 'border-[#F9A825] text-[#F9A825]'
                        : 'border-transparent text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      selectedTime === time
                        ? 'border-[#F9A825] bg-rgba(249,168,37,0.15) text-[#F9A825]'
                        : 'border-[#2A2A2A] bg-[#1E1E1E] text-white hover:border-[#F9A825]'
                    }`}
                  >
                    <div>{time}</div>
                  </button>
                ))}
              </div>
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
                  <p className="text-[#9E9E9E] text-sm mt-1 capitalize">
                    {selectedDate === 'today' ? 'Today' : selectedDate.charAt(0).toUpperCase() + selectedDate.slice(1)}
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
                ACTIVATE WAR MODE ⚔️
              </button>

              <p className="text-[#9E9E9E] text-xs text-center">
                You'll be matched with a partner within seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
