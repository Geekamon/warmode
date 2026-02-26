'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account first.');
      } else if (msg.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
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
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F9A825' }}>
            WAR
          </h1>
          <p className="text-lg" style={{ color: '#9E9E9E' }}>
            MODE
          </p>
          <p className="text-sm mt-2" style={{ color: '#616161' }}>
            Time to activate
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg text-sm text-white text-center"
              style={{ backgroundColor: '#D32F2F' }}
            >
              {error}
            </div>
          )}

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
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

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border text-white placeholder-gray-500 focus:outline-none focus:border-2 transition"
              style={{
                backgroundColor: '#111111',
                borderColor: '#2A2A2A',
                color: '#FFFFFF',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#F9A825')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
            />
            <a
              href="/forgot-password"
              className="text-xs mt-1 inline-block transition hover:opacity-80"
              style={{ color: '#F9A825' }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#F9A825',
              color: '#0A0A0A',
            }}
          >
            {loading || authLoading ? 'ACTIVATING...' : 'ACTIVATE WAR MODE'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p style={{ color: '#9E9E9E' }}>
            Don't have an account?{' '}
            <a
              href="/signup"
              className="font-semibold transition hover:opacity-80"
              style={{ color: '#F9A825' }}
            >
              Create One
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
