'use client';

import { AuthProvider, useAuth } from './auth-context';

function LoadingGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center z-[9999]">
        <div className="text-center">
          <div className="mb-6">
            <span className="text-5xl">⚔️</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F9A825] tracking-widest mb-2">
            WARMODE
          </h1>
          <div className="mt-6">
            <div className="w-8 h-8 border-2 border-[#F9A825] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LoadingGate>{children}</LoadingGate>
    </AuthProvider>
  );
}
