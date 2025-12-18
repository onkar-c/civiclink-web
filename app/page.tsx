// civiclink-web/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/context/AuthContext';

function getDefaultRouteForRole(role: string | undefined): string {
  switch (role) {
    case 'DISPATCHER':
      return '/dispatcher';
    case 'ADMIN':
      return '/admin';
    case 'CITIZEN':
    default:
      return '/citizen';
  }
}

export default function HomePage() {
  const { token, user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && token && user) {
      const target = getDefaultRouteForRole(user.role);
      router.replace(target);
    }
  }, [initializing, token, user, router]);

  const isAuthenticated = !!token && !!user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/50">
        <h1 className="text-2xl font-semibold mb-2">CivicLink</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in to report issues or manage operations.
        </p>

        {!isAuthenticated && (
          <>
            <LoginForm />
            {initializing && (
              <p className="mt-3 text-[11px] text-slate-500">
                Restoring previous session…
              </p>
            )}
          </>
        )}

        {isAuthenticated && (
          <p className="text-sm text-slate-400">
            Redirecting you to your dashboard…
          </p>
        )}
      </div>
    </div>
  );
}
