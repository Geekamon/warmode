'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">💥</div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-[#9E9E9E] mb-8">
          An unexpected error occurred. Try refreshing the page.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="bg-[#F9A825] text-[#0A0A0A] font-bold py-3 px-8 rounded-lg hover:bg-[#F9B840] transition-all duration-200"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="text-[#9E9E9E] hover:text-white transition-colors text-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
