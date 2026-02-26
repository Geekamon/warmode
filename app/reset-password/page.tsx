'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user arrived via reset link (Supabase sets session automatically)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
      }
      setChecking(false);
    };

    // Listen for auth events — Supabase fires PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setHasSession(true);
          setChecking(false);
        }
      }
    );

    checkSession();

    return () => subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      if (err?.message?.includes('same password')) {
        setError('New password must be different from your current password.');
      } else {
        setError(err?.message || 'Failed to reset password. Please try again.');
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
            Set a new password
          </p>
        </div>

        {checking ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#F9A825] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9E9E9E] text-sm">Verifying reset link...</p>
          </div>
        ) : !hasSession ? (
          /* Invalid or expired link */
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white">Link expired or invalid</h2>
            <p className="text-[#9E9E9E] text-sm leading-relaxed">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
            <a
              href="/forgot-password"
              className="block w-full py-3 rounded-lg font-bold text-lg text-center transition hover:opacity-90"
              style={{ backgroundColor: '#F9A825', color: '#0A0A0A' }}
            >
              Request New Link
            </a>
          </div>
        ) : success ? (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white">Password updated!</h2>
            <p className="text-[#9E9E9E] text-sm">
              Redirecting you to the dashboard...
            </p>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-lg text-sm text-white text-center"
                style={{ backgroundColor: '#D32F2F' }}
              >
                {error}
              </div>
            )}

            {/* New Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#FFFFFF' }}
              >
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#FFFFFF' }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again"
                className="w-full px-4 py-2 rounded-lg border text-white placeholder-gray-500 focus:outline-none focus:border-2 transition"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#2A2A2A',
                  color: '#FFFFFF',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#F9A825')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F9A825', color: '#0A0A0A' }}
            >
              {loading ? 'UPDATING...' : 'SET NEW PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
