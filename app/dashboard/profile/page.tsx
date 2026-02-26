'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('');

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification preferences (stored in localStorage for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setRole(profile.role || '');
    }
  }, [profile]);

  // Load notification prefs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefs = localStorage.getItem('warmode_notif_prefs');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        setEmailNotifications(parsed.email ?? true);
        setSessionReminders(parsed.reminders ?? true);
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        city,
        role: role as 'remote' | 'student' | 'entrepreneur' | 'creative',
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPasswordSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveNotifPrefs = () => {
    localStorage.setItem('warmode_notif_prefs', JSON.stringify({
      email: emailNotifications,
      reminders: sessionReminders,
    }));
    setShowNotifSettings(false);
    setMessage({ type: 'success', text: 'Notification preferences saved!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const getPlanDisplay = (plan: string) => {
    const plans: Record<string, string> = {
      free: 'Free Plan',
      soldier: 'Soldier Plan',
      student_plan: 'Student Plan',
      squad: 'Squad Plan',
    };
    return plans[plan] || 'Free Plan';
  };

  const getRoleDisplay = (r: string) => {
    const roles: Record<string, string> = {
      remote: 'Remote Worker',
      student: 'Student',
      entrepreneur: 'Entrepreneur',
      creative: 'Creative',
    };
    return roles[r] || r;
  };

  if (!user || !profile) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F9A825] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-4 md:p-8 pb-24 md:pb-8">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
          message.type === 'success'
            ? 'bg-[#4CAF50] text-white'
            : 'bg-[#D32F2F] text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* PROFILE HEADER CARD */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-4 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
              <span className="text-xl md:text-3xl font-bold text-[#0A0A0A]">
                {getInitials(profile.full_name)}
              </span>
            </div>

            {/* Profile Info */}
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white text-lg md:text-xl font-bold w-full focus:border-[#F9A825] outline-none"
                    placeholder="Full name"
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9A825] outline-none"
                    >
                      <option value="remote">Remote Worker</option>
                      <option value="student">Student</option>
                      <option value="entrepreneur">Entrepreneur</option>
                      <option value="creative">Creative</option>
                    </select>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9A825] outline-none"
                      placeholder="City"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                    {profile.full_name}
                  </h1>
                  <p className="text-[#9E9E9E] mb-3 md:mb-4 text-sm md:text-base">
                    {getRoleDisplay(profile.role)} {profile.city ? `• ${profile.city}` : ''}
                  </p>
                </>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#F9A825] bg-opacity-15 border border-[#F9A825] rounded-lg text-xs md:text-sm font-semibold text-[#F9A825]">
                  {getPlanDisplay(profile.plan)}
                </span>
                <span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#4CAF50] bg-opacity-15 border border-[#4CAF50] rounded-lg text-xs md:text-sm font-semibold text-[#4CAF50]">
                  {profile.total_sessions} Sessions
                </span>
                {profile.streak_current > 0 && (
                  <span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#FF5722] bg-opacity-15 border border-[#FF5722] rounded-lg text-xs md:text-sm font-semibold text-[#FF5722]">
                    {profile.streak_current} Day Streak
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit / Save / Cancel */}
          <div className="flex gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile.full_name);
                    setPhone(profile.phone);
                    setCity(profile.city);
                    setRole(profile.role);
                  }}
                  className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold border border-[#2A2A2A] text-white hover:bg-[#252525] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold bg-[#F9A825] text-[#0A0A0A] hover:bg-[#F9B840] transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold border border-[#2A2A2A] text-white hover:bg-[#252525] transition-colors text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SETTINGS SECTIONS */}
      <div className="space-y-6 max-w-2xl">
        {/* ACCOUNT SECTION */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-white">Account</h2>
          </div>

          <div className="divide-y divide-[#2A2A2A]">
            {/* Email */}
            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Email</p>
                <p className="text-white font-medium text-sm md:text-base">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="px-4 md:px-6 py-4 md:py-5">
              {isEditing ? (
                <div>
                  <p className="text-sm text-[#9E9E9E] mb-2">Phone</p>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white w-full focus:border-[#F9A825] outline-none text-sm"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9E9E9E] mb-1">Phone</p>
                    <p className="text-white font-medium text-sm md:text-base">
                      {profile.phone || 'Not set'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors"
                  >
                    {profile.phone ? 'Change' : 'Add'}
                  </button>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="px-4 md:px-6 py-4 md:py-5">
              {showPasswordChange ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#9E9E9E] mb-2">New Password</p>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white w-full focus:border-[#F9A825] outline-none text-sm"
                    placeholder="New password (min 6 characters)"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white w-full focus:border-[#F9A825] outline-none text-sm"
                    placeholder="Confirm new password"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#2A2A2A] text-white hover:bg-[#252525]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F9A825] text-[#0A0A0A] hover:bg-[#F9B840] disabled:opacity-50"
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9E9E9E] mb-1">Password</p>
                    <p className="text-white font-medium">••••••••</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="px-4 md:px-6 py-4 md:py-5">
              {showNotifSettings ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#9E9E9E]">Notification Preferences</p>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white text-sm">Email notifications</span>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        emailNotifications ? 'bg-[#F9A825]' : 'bg-[#2A2A2A]'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white text-sm">Session reminders (15 min before)</span>
                    <button
                      onClick={() => setSessionReminders(!sessionReminders)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        sessionReminders ? 'bg-[#F9A825]' : 'bg-[#2A2A2A]'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        sessionReminders ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNotifSettings(false)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#2A2A2A] text-white hover:bg-[#252525]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotifPrefs}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F9A825] text-[#0A0A0A] hover:bg-[#F9B840]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9E9E9E] mb-1">Notifications</p>
                    <p className="text-white font-medium text-sm md:text-base">
                      {emailNotifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNotifSettings(true)}
                    className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors"
                  >
                    Manage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION SECTION */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-white">Subscription</h2>
          </div>

          <div className="divide-y divide-[#2A2A2A]">
            {/* Plan */}
            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Plan</p>
                <p className="text-white font-medium">{getPlanDisplay(profile.plan)}</p>
              </div>
              <span className="text-[#9E9E9E] text-sm">Coming soon</span>
            </div>

            {/* Payment Method */}
            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Payment Method</p>
                <p className="text-white font-medium">Not set up yet</p>
                <p className="text-xs text-[#9E9E9E] mt-1">Paystack integration coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-white">Your Stats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2A2A2A]">
            <div className="bg-[#1E1E1E] p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#F9A825]">{profile.total_sessions}</p>
              <p className="text-[#9E9E9E] text-xs md:text-sm mt-1">Sessions</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#F9A825]">{profile.total_hours.toFixed(1)}</p>
              <p className="text-[#9E9E9E] text-xs md:text-sm mt-1">Hours</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#FF5722]">{profile.streak_current}</p>
              <p className="text-[#9E9E9E] text-xs md:text-sm mt-1">Current Streak</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#4CAF50]">{profile.streak_best}</p>
              <p className="text-[#9E9E9E] text-xs md:text-sm mt-1">Best Streak</p>
            </div>
          </div>
        </div>

        {/* MEMBER SINCE */}
        <div className="text-center text-[#9E9E9E] text-sm py-4">
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </div>

        {/* LOG OUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 rounded-lg font-semibold border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white transition-colors duration-200"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
