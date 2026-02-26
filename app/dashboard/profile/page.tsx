'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-8">
      {/* PROFILE HEADER CARD */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F9A825] to-[#E89B1F] flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-[#0A0A0A]">A</span>
            </div>

            {/* Profile Info */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Adaeze Okafor
              </h1>
              <p className="text-[#9E9E9E] mb-4">
                Remote Worker • Lagos
              </p>

              {/* Badges */}
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-[#F9A825] bg-opacity-15 border border-[#F9A825] rounded-lg text-sm font-semibold text-[#F9A825]">
                  Soldier Plan
                </span>
                <span className="px-4 py-2 bg-[#4CAF50] bg-opacity-15 border border-[#4CAF50] rounded-lg text-sm font-semibold text-[#4CAF50]">
                  47 Sessions
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-6 py-3 rounded-lg font-semibold border border-[#2A2A2A] text-white hover:bg-[#252525] transition-colors"
          >
            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* SETTINGS SECTIONS */}
      <div className="space-y-6 max-w-2xl">
        {/* ACCOUNT SECTION */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-white">Account</h2>
          </div>

          <div className="divide-y divide-[#2A2A2A]">
            {/* Email */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Email</p>
                <p className="text-white font-medium">adaeze@example.com</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Phone */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Phone</p>
                <p className="text-white font-medium">+234 801 234 5678</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Password */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Password</p>
                <p className="text-white font-medium">••••••••</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Notifications */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Notifications</p>
                <p className="text-white font-medium">Enabled</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION SECTION */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-white">Subscription</h2>
          </div>

          <div className="divide-y divide-[#2A2A2A]">
            {/* Plan */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Plan</p>
                <p className="text-white font-medium">Soldier • ₦1,500/mo</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Payment Method */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Payment Method</p>
                <p className="text-white font-medium">Not set up yet</p>
                <p className="text-xs text-[#9E9E9E] mt-1">Free plan — upgrade anytime</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Add payment method
              </button>
            </div>
          </div>
        </div>

        {/* SESSION PREFERENCES SECTION */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-lg font-semibold text-white">
              Session Preferences
            </h2>
          </div>

          <div className="divide-y divide-[#2A2A2A]">
            {/* Default Duration */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Default Duration</p>
                <p className="text-white font-medium">50 minutes</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Mode */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Default Mode</p>
                <p className="text-white font-medium">📹 Video</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Match Preference */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Match Preference</p>
                <p className="text-white font-medium">Same timezone</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Change
              </button>
            </div>

            {/* Low Data Mode */}
            <div className="px-6 py-5 flex items-center justify-between hover:bg-[#252525] transition-colors">
              <div>
                <p className="text-sm text-[#9E9E9E] mb-1">Low Data Mode</p>
                <p className="text-white font-medium">Disabled</p>
              </div>
              <button className="text-[#F9A825] hover:text-[#E89B1F] font-semibold text-sm transition-colors">
                Toggle
              </button>
            </div>
          </div>
        </div>

        {/* LOG OUT BUTTON */}
        <button className="w-full px-6 py-3 rounded-lg font-semibold border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white transition-colors duration-200 mt-8">
          Log Out
        </button>
      </div>
    </div>
  );
}
