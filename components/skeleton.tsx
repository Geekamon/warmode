'use client';

// Skeleton loader components for smooth data loading

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 animate-pulse ${className}`}>
      <div className="w-8 h-8 bg-[#2A2A2A] rounded mb-4" />
      <div className="w-20 h-3 bg-[#2A2A2A] rounded mb-3" />
      <div className="w-16 h-8 bg-[#2A2A2A] rounded" />
    </div>
  );
}

export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 animate-pulse ${className}`}>
      <div className="w-32 h-5 bg-[#2A2A2A] rounded mb-6" />
      <div className="flex items-end gap-2 h-[200px]">
        {[40, 65, 30, 80, 55, 45, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[#2A2A2A] rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonSessionCard() {
  return (
    <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 animate-pulse">
      <div className="w-32 h-5 bg-[#2A2A2A] rounded mb-6" />
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#2A2A2A]">
        <div className="w-14 h-14 rounded-full bg-[#2A2A2A]" />
        <div>
          <div className="w-24 h-4 bg-[#2A2A2A] rounded mb-2" />
          <div className="w-36 h-3 bg-[#2A2A2A] rounded" />
        </div>
      </div>
      <div className="w-20 h-3 bg-[#2A2A2A] rounded mb-2" />
      <div className="w-28 h-7 bg-[#2A2A2A] rounded mb-5" />
      <div className="w-full h-12 bg-[#2A2A2A] rounded-lg" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 animate-pulse">
      <div className="w-32 h-5 bg-[#2A2A2A] rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-b-0">
            <div>
              <div className="w-28 h-4 bg-[#2A2A2A] rounded mb-2" />
              <div className="w-20 h-3 bg-[#2A2A2A] rounded" />
            </div>
            <div className="text-right">
              <div className="w-16 h-4 bg-[#2A2A2A] rounded mb-2" />
              <div className="w-12 h-3 bg-[#2A2A2A] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
