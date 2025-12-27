// app/(dashboard)/citizen/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { MyIssuesPanel } from '@/features/issues/components/MyIssuesPanel';

export default function CitizenDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
             <div className="text-slate-400 mb-1">Welcome</div> {user?.name || 'Citizen'}
          </h1>
        </div>
        <Link
          href="/citizen/new"
          className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
        >
          + Report new issue
        </Link>
      </header>
       <MyIssuesPanel />
      
    </div>
  );
}
