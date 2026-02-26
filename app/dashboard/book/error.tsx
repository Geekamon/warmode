'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Booking error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">😤</div>
        <h2 className="text-2xl font-bold text-white mb-3">Session Error</h2>
        <p className="text-[#9E9E9E] mb-8">
          Something went wrong with your session. This could be a connection issue.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="bg-[#F9A825] text-[#0A0A0A] font-bold py-3 px-8 rounded-lg hover:bg-[#F9B840] transition-all duration-200"
          >
            Try Again
          </button>
          <Link
            href="/dashboard/book"
            className="text-[#9E9E9E] hover:text-white transition-colors text-sm"
          >
            Back to Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
