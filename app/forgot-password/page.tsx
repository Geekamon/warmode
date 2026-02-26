'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      if (err?.message?.includes('Too many requests')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        // Don't reveal if email exists or not for security
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div
        className="w-full max-w-md rounded-lg p-8 shadow-lg"
        style={{ backgroundColor: '#1E1E1E' }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F9A825' }}>
            WAR
          </h1>
          <p className="text-lg" style={{ color: '#9E9E9E' }}>
            MODE
          </p>
          <p className="text-sm mt-2" style={{ color: '#616161' }}>
            Reset your password
          </p>
        </div>

        {sent ? (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="text-[#9E9E9E] text-sm leading-relaxed">
              If an account exists with <strong className="text-white">{email}</strong>,
              we sent a password reset link. Check your inbox and spam folder.
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full py-3 rounded-lg font-semibold text-sm border transition hover:bg-[#252525]"
                style={{ borderColor: '#2A2A2A', color: '#FFFFFF' }}
              >
                Try a different email
              </button>
              <a
                href="/login"
                className="block w-full py-3 rounded-lg font-bold text-lg text-center transition hover:opacity-90"
                style={{ backgroundColor: '#F9A825', color: '#0A0A0A' }}
              >
                Back to Login
              </a>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-lg text-sm text-white text-center"
                style={{ backgroundColor: '#D32F2F' }}
              >
                {error}
              </div>
            )}

            <p className="text-[#9E9E9E] text-sm">
              Enter the email address you used to sign up and we&apos;ll send you a link to reset your password.
            </p>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#FFFFFF' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border text-white placeholder-gray-500 focus:outline-none focus:border-2 transition"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#2A2A2A',
                  color: '#FFFFFF',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#F9A825')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
                autoFocus
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F9A825', color: '#0A0A0A' }}
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>

            {/* Back to login */}
            <div className="text-center">
              <a
                href="/login"
                className="text-sm transition hover:opacity-80"
                style={{ color: '#9E9E9E' }}
              >
                Back to Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
