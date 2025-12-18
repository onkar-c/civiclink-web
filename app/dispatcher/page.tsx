// app/(dashboard)/dispatcher/page.tsx
'use client';

import { useAuth } from '@/features/auth/context/AuthContext';
import { DispatcherIssuesPanel } from '@/features/issues/components/DispatcherIssuesPanel';

export default function DispatcherDashboardPage() {
  const {token, user } = useAuth();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Dispatcher board
          </h1>
          <p className="text-xs text-slate-400">
            Triage, assign, and track issues reported by citizens.
          </p>
        </div>
        <div className="text-[10px] text-slate-500 text-right">
          <div className="text-slate-300 font-medium">
            {user?.name || 'Dispatcher'}
          </div>
          <div>{user?.email}</div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-[11px]">
        <DispatcherIssuesPanel token={token} />
      </section>
    </div>
  );
}



