'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';

type NavItem = {
  href: string;
  label: string;
  roles?: Array<'CITIZEN' | 'DISPATCHER' | 'ADMIN'>;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/citizen',
    label: 'Citizen',
    roles: ['CITIZEN', 'DISPATCHER', 'ADMIN'],
  },
  {
    href: '/dispatcher',
    label: 'Dispatcher',
    roles: ['DISPATCHER', 'ADMIN'],
  },
  {
    href: '/admin',
    label: 'Admin',
    roles: ['ADMIN'],
  },
  {
    href: '/admin/users',
    label: 'Users',
    roles: ['ADMIN'],
  },
];

export function AppHeader() {
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const role = user?.role ?? null;

  const filteredNav = NAV_ITEMS.filter(item =>
    role ? item.roles?.includes(role as any) : false,
  );

    const handleLogout = () => {
    logout();              // clears state + localStorage
    router.push('/');      // navigate to login
  };


  return (
    <header className="border-b border-slate-900 bg-slate-950/95 backdrop-blur flex items-center justify-between px-4 py-3 md:px-8">
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-xs font-bold text-emerald-400">
            CL
          </span>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-slate-100">
              CivicLink
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              City issue manager
            </span>
          </div>
        </button>
      </div>

      {/* Center: nav */}
      <nav className="hidden md:flex items-center gap-4 text-xs">
        {token && user && filteredNav.length > 0 && (
          filteredNav.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'px-2 py-1 rounded-md transition-colors',
                  isActive
                    ? 'bg-slate-900 text-emerald-300 border border-slate-700'
                    : 'text-slate-300 hover:text-emerald-200 hover:bg-slate-900/60 border border-transparent',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })
        )}

        {!token && (
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-2 py-1 text-slate-300 text-xs hover:text-emerald-200"
          >
            Sign in
          </button>
        )}
      </nav>

      {/* Right: user + logout */}
      <div className="flex items-center gap-3 text-[11px]">
        {user && token ? (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-medium text-slate-100">
                {user.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500">
                {user.email}
              </span>
              <span className="mt-0.5 inline-flex items-center rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-400">
                {user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
