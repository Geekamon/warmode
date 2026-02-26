'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface Role {
  id: string;
  label: string;
  icon: string;
}

const ROLES: Role[] = [
  { id: 'remote', label: 'Remote Worker', icon: '💼' },
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: '🚀' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup');
    }
  }, [authLoading, user, router]);

  // Pre-fill city if profile already has one
  useEffect(() => {
    if (profile?.city) setCity(profile.city);
    if (profile?.role) setSelectedRole(profile.role);
  }, [profile]);

  const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedRole) {
      setError('Please select a role');
      setLoading(false);
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city');
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        role: selectedRole as 'remote' | 'student' | 'entrepreneur' | 'creative',
        city: city.trim(),
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#F9A825] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div
        className="w-full max-w-2xl rounded-lg p-8 shadow-lg"
        style={{ backgroundColor: '#1E1E1E' }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
            Welcome to WarMode
          </h1>
          <p style={{ color: '#9E9E9E' }}>
            Tell us a bit about yourself
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleContinue} className="space-y-8">
          {error && (
            <div
              className="p-3 rounded-lg text-sm text-white text-center"
              style={{ backgroundColor: '#D32F2F' }}
            >
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label
              className="block text-sm font-medium mb-4"
              style={{ color: '#FFFFFF' }}
            >
              What brings you here?
            </label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className="p-4 rounded-lg border-2 transition transform hover:scale-105"
                  style={{
                    backgroundColor:
                      selectedRole === role.id ? '#F9A825' : '#111111',
                    borderColor:
                      selectedRole === role.id ? '#F9A825' : '#2A2A2A',
                    color:
                      selectedRole === role.id ? '#0A0A0A' : '#FFFFFF',
                  }}
                >
                  <div className="text-3xl mb-2">{role.icon}</div>
                  <div className="text-sm font-semibold">{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* City Input */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Your City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Lagos, Abuja, Port Harcourt"
              className="w-full px-4 py-3 rounded-lg border text-white placeholder-gray-500 focus:outline-none focus:border-2 transition"
              style={{
                backgroundColor: '#111111',
                borderColor: '#2A2A2A',
                color: '#FFFFFF',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#F9A825')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
            />
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#F9A825',
              color: '#0A0A0A',
            }}
          >
            {loading ? 'SETTING UP...' : 'CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  );
}