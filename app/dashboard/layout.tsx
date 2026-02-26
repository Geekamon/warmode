'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Book Session', href: '/dashboard/book', icon: '📅' },
  { label: 'My Sessions', href: '/dashboard/sessions', icon: '⚔️' },
  { label: 'Stats', href: '/dashboard/stats', icon: '📈' },
  { label: 'Community', href: '/dashboard/community', icon: '👥' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2A2A2A] border-t-[#F9A825]"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* LEFT SIDEBAR */}
      <aside className="w-60 border-r border-[#2A2A2A] flex flex-col bg-[#111111]">
        {/* LOGO */}
        <div className="px-6 py-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            <span className="text-lg font-bold text-white tracking-wider">
              WARMODE
            </span>
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F9A825] text-[#0A0A0A] font-semibold'
                    : 'text-[#B0B0B0] hover:text-white hover:bg-[#252525]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE AT BOTTOM */}
        <div className="px-3 py-6 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-3 px-3">
            {/* Avatar Circle */}
            <div className="w-12 h-12 rounded-full bg-[#F9A825] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#0A0A0A]">
                {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-[#9E9E9E] truncate capitalize">
                {profile?.plan ? profile.plan.replace('_', ' ') : 'Free Plan'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
