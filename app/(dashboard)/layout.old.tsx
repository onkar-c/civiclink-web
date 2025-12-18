'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';

type DashboardLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  roles?: Array<'CITIZEN' | 'DISPATCHER' | 'ADMIN'>;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Citizen dashboard',
    href: '/citizen',
    roles: ['CITIZEN', 'DISPATCHER', 'ADMIN'],
  },
  {
    label: 'Dispatcher board',
    href: '/dispatcher',
    roles: ['DISPATCHER', 'ADMIN'],
  },
  {
    label: 'Admin overview',
    href: '/admin',
    roles: ['ADMIN'],
  },
  {
    label: 'Manage users',
    href: '/admin/users',
    roles: ['ADMIN'],
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, token, logout, initializing } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const role = user?.role ?? 'CITIZEN'; // fallback so layout still works

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-400">Loading CivicLink…</div>
      </div>
    );
  }

  // Optional: soft guard – if no token/user, give link back to login
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-sm">
          <h1 className="text-lg font-semibold mb-2">Sign in required</h1>
          <p className="text-slate-400 mb-4">
            You need to be signed in to access dashboard pages.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const filteredNav = NAV_ITEMS.filter(item =>
    item.roles ? item.roles.includes(role as any) : true,
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-900 bg-slate-950/90">
        <div className="px-4 py-4 border-b border-slate-900">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            CIVICLINK
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            City service & issue management
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 text-xs">
          <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Navigation
          </div>
          <ul className="space-y-1">
            {filteredNav.map(item => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      'flex items-center rounded-lg px-3 py-2 text-[11px] transition-colors',
                      isActive
                        ? 'bg-slate-900 text-emerald-300 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-900/70 hover:text-emerald-200 border border-transparent',
                    ].join(' ')}
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-3 border-t border-slate-900 text-[11px]">
          <div className="text-slate-300 font-medium">
            {user.name || 'User'}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {user.email}
          </div>
          <div className="mt-1 inline-flex items-center rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-400">
            {user.role}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] text-slate-300 hover:border-emerald-400 hover:text-emerald-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (visible also on mobile) */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-900 bg-slate-950/95 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-400">
              CL
            </span>
            <div>
              <div className="text-xs font-semibold text-slate-100">
                CivicLink
              </div>
              <div className="text-[10px] text-slate-500">
                {role === 'ADMIN'
                  ? 'Admin workspace'
                  : role === 'DISPATCHER'
                  ? 'Dispatcher workspace'
                  : 'Citizen workspace'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-medium text-slate-100">
                {user.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500">
                {user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] text-slate-300 hover:border-emerald-400 hover:text-emerald-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
