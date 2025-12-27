
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAllIssues, type IssuesListResult } from '@/features/issues/api';
import type { Issue } from '@/features/issues/types';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { token, user, initializing } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }>({
    total: 0,
    byStatus: {},
    byPriority: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load issues + stats only when admin is present
  useEffect(() => {
    if (!token || !user || user.role !== 'ADMIN') return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result: IssuesListResult = await getAllIssues(token, {
          page: 1,
          pageSize: 200,
        });

        if (cancelled) return;

        setIssues(result.issues);

        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};

        for (const issue of result.issues) {
          byStatus[issue.status] = (byStatus[issue.status] ?? 0) + 1;
          byPriority[issue.priority] =
            (byPriority[issue.priority] ?? 0) + 1;
        }

        setStats({
          total: result.total,
          byStatus,
          byPriority,
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load admin stats');
          setIssues([]);
          setStats({
            total: 0,
            byStatus: {},
            byPriority: {},
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  // While auth is initializing, show nothing / a simple splash
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-400">
          Loading CivicLink…
        </div>
      </div>
    );
  }

  // Not logged in
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-sm">
          <h1 className="text-lg font-semibold mb-2">Admin dashboard</h1>
          <p className="text-slate-400">
            You must be signed in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-sm">
          <h1 className="text-lg font-semibold mb-2">Admin dashboard</h1>
          <p className="text-slate-400 mb-2">
            You are signed in as{' '}
            <span className="font-semibold">{user.role}</span>, but this
            page is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  // Main admin UI
  return (
    <div className="flex-1 flex flex-col px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-slate-400">
            High-level view of city issue reporting and operations.
          </p>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-xs uppercase text-slate-400 mb-1">
            Total issues
          </div>
          <div className="text-2xl font-semibold">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across the last fetched page
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-xs uppercase text-slate-400 mb-1">
            Open / In progress
          </div>
          <div className="text-lg font-semibold">
            {(stats.byStatus['OPEN'] ?? 0) +
              (stats.byStatus['IN_PROGRESS'] ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Open: {stats.byStatus['OPEN'] ?? 0} · In progress:{' '}
            {stats.byStatus['IN_PROGRESS'] ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-xs uppercase text-slate-400 mb-1">
            High priority
          </div>
          <div className="text-lg font-semibold">
            {stats.byPriority['HIGH'] ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Medium: {stats.byPriority['MEDIUM'] ?? 0} · Low:{' '}
            {stats.byPriority['LOW'] ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-xs uppercase text-slate-400 mb-1">
            Users
          </div>
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              Manage
            </Link>
          </div>
        </div>
      </div>

      {/* Detail list */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Recent issues snapshot
            </h2>
            <p className="text-[11px] text-slate-400">
              Latest fetched issues with status and priority.
            </p>
          </div>
          {loading && (
            <span className="text-[11px] text-slate-400">
              Loading…
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-amber-400 mb-2">
            {error}
          </p>
        )}

        {!loading && issues.length === 0 && !error && (
          <p className="text-xs text-slate-500">
            No issues found in the current dataset.
          </p>
        )}

        {issues.length > 0 && (
          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-slate-900 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-300">
                    Title
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-slate-300">
                    Status
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-slate-300">
                    Priority
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-slate-300">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr
                    key={issue.id}
                    className="border-t border-slate-800 hover:bg-slate-900/70"
                  >
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium text-slate-100">
                        {issue.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {issue.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top text-slate-400">
                      {new Date(issue.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
