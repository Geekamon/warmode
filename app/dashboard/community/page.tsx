'use client';

const leaderboardData = [
  { rank: 1, name: 'Chioma D.', sessions: 156, streak: 12 },
  { rank: 2, name: 'Tunde M.', sessions: 142, streak: 8 },
  { rank: 3, name: 'Blessing O.', sessions: 138, streak: 15 },
  { rank: 4, name: 'Kola A.', sessions: 125, streak: 7 },
  { rank: 5, name: 'Zainab H.', sessions: 118, streak: 10 },
];

const favoritePartners = [
  {
    name: 'Chioma D.',
    role: 'Product Manager',
    city: 'Lagos',
    sessions: 24,
    online: true,
  },
  {
    name: 'Tunde M.',
    role: 'Software Engineer',
    city: 'Abuja',
    sessions: 18,
    online: false,
  },
  {
    name: 'Blessing O.',
    role: 'Designer',
    city: 'Portharcourt',
    sessions: 16,
    online: true,
  },
  {
    name: 'Kola A.',
    role: 'Marketer',
    city: 'Lagos',
    sessions: 14,
    online: true,
  },
  {
    name: 'Ada O.',
    role: 'Data Analyst',
    city: 'Lagos',
    sessions: 12,
    online: false,
  },
];

export default function CommunityPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Community</h1>
        <p className="text-[#9E9E9E]">Connect with warriors around you</p>
      </div>

      {/* 3 STAT CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Warriors Online */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">🟢</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-2">Warriors Online</p>
          <p className="text-3xl font-bold text-[#4CAF50]">1,247</p>
          <p className="text-xs text-[#616161] mt-3">Active right now</p>
        </div>

        {/* Total Warriors */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-2">Total Warriors</p>
          <p className="text-3xl font-bold text-white">18,402</p>
          <p className="text-xs text-[#616161] mt-3">In the community</p>
        </div>

        {/* Sessions This Month */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:bg-[#252525] transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">⚔️</span>
          </div>
          <p className="text-[#9E9E9E] text-sm mb-2">Sessions This Month</p>
          <p className="text-3xl font-bold text-[#F9A825]">142K</p>
          <p className="text-xs text-[#616161] mt-3">Focus sessions</p>
        </div>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEADERBOARD */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Top Warriors - Lagos
          </h2>

          <div className="space-y-4">
            {leaderboardData.map((warrior) => (
              <div
                key={warrior.rank}
                className="flex items-center justify-between py-4 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F9A825] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#0A0A0A]">
                      {warrior.rank}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {warrior.name}
                    </p>
                    <p className="text-xs text-[#616161]">
                      🔥 {warrior.streak} day streak
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#4CAF50]">
                  {warrior.sessions} sessions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAVORITE PARTNERS */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Favorite Partners
          </h2>

          <div className="space-y-4">
            {favoritePartners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 px-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-[#F9A825] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#0A0A0A]">
                        {partner.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    {partner.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF50] rounded-full border 2 border-[#1E1E1E]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {partner.name}
                    </p>
                    <p className="text-xs text-[#616161]">
                      {partner.role} • {partner.city}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#F9A825]">
                  {partner.sessions}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
