'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompletePage() {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<string | null>(null);

  const handleBookAnother = () => {
    router.push('/dashboard/book');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const ratings = [
    { value: 'fire', icon: '🔥', label: 'Fire' },
    { value: 'good', icon: '👍', label: 'Good' },
    { value: 'okay', icon: '😐', label: 'Okay' },
    { value: 'bad', icon: '👎', label: 'Bad' },
  ];

  const stats = [
    { label: 'Duration', value: '50 min', icon: '⏱️' },
    { label: 'Streak', value: '🔥 8 days', icon: null },
    { label: 'Total', value: '#48', icon: '⚔️' },
    { label: 'Focus Score', value: '96%', icon: '📊' },
  ];

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        {/* Success Icon */}
        <div className="text-6xl mb-6">⚔️</div>

        {/* Main Message */}
        <h1 className="text-5xl font-bold text-[#F9A825] mb-3">MISSION COMPLETE</h1>
        <p className="text-2xl text-white mb-12">You showed up. That's the win.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#1E1E1E] p-6 rounded-lg border border-[#2A2A2A]">
              {stat.icon && <div className="text-3xl mb-2">{stat.icon}</div>}
              <p className="text-[#9E9E9E] text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Rating Section */}
        <div className="mb-12">
          <p className="text-white font-semibold mb-4">How was this session?</p>
          <div className="flex gap-3 justify-center">
            {ratings.map((rating) => (
              <button
                key={rating.value}
                onClick={() => setSelectedRating(rating.value)}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition-all duration-200 ${
                  selectedRating === rating.value
                    ? 'bg-[#F9A825] text-[#0A0A0A]'
                    : 'bg-[#1E1E1E] text-white border border-[#2A2A2A] hover:border-[#F9A825]'
                }`}
              >
                <span className="text-2xl">{rating.icon}</span>
                <span className="text-sm font-semibold">{rating.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBookAnother}
            className="bg-[#F9A825] text-[#0A0A0A] font-bold py-4 px-12 rounded-lg hover:bg-[#F9B840] transition-all duration-200 text-lg"
          >
            Book Another Session
          </button>

          <button
            onClick={handleBackToDashboard}
            className="bg-[#1E1E1E] text-white font-bold py-4 px-12 rounded-lg border border-[#2A2A2A] hover:border-white transition-all duration-200 text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
