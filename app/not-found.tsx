import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-6xl">⚔️</span>
        </div>
        <h1
          className="text-8xl font-black mb-4"
          style={{ color: '#F9A825' }}
        >
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Lost in Battle
        </h2>
        <p className="text-gray-400 mb-8">
          This page doesn&apos;t exist. The battlefield has shifted — let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            style={{ backgroundColor: '#F9A825' }}
            className="px-8 py-3 font-bold text-black rounded-lg hover:opacity-90 transition"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 font-bold text-white rounded-lg border-2 hover:bg-white hover:bg-opacity-5 transition"
            style={{ borderColor: '#F9A825' }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
