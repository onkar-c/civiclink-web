// app/(dashboard)/citizen/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function CitizenDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Citizen dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Report and track local issues in your neighborhood.
          </p>
        </div>
        <Link
          href="/citizen/new"
          className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
        >
          + Report new issue
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-[11px]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-slate-400 mb-1">Welcome</div>
          <div className="text-slate-100 font-medium">
            {user?.name || 'Citizen'}
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Use this space to keep track of your reported issues.
          </p>
        </div>
        {/* You can later add: open issues count, resolved count, etc. */}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-[11px]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-100">
            Your recent issues
          </h2>
          <span className="text-[10px] text-slate-500">
            Coming from GET /issues?createdBy=you
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          We will hook this up to a real API call that fetches issues created
          by the current user. For now, this is a placeholder card.
        </p>
      </section>
    </div>
  );
}
