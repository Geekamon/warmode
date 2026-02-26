'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
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
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
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
            Prepare for productivity
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

          {/* Full Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
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

          {/* Phone */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Phone
            </label>
            <div className="flex items-center">
              <span
                className="px-3 py-2 rounded-l-lg border"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#2A2A2A',
                  color: '#F9A825',
                }}
              >
                +234
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="8012345678"
                className="flex-1 px-4 py-2 rounded-r-lg border border-l-0 text-white placeholder-gray-500 focus:outline-none focus:border-2 transition"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#2A2A2A',
                  color: '#FFFFFF',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#F9A825')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
              />
            </div>
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
            {loading || authLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p style={{ color: '#9E9E9E' }}>
            Already have an account?{' '}
            <a
              href="/login"
              className="font-semibold transition hover:opacity-80"
              style={{ color: '#F9A825' }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
