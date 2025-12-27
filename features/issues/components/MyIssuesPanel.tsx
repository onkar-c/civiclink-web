// civiclink-web/features/issues/components/MyIssuesPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getMyIssues } from '@/features/issues/api';
import type { Issue } from '@/features/issues/types';

export function MyIssuesPanel() {
  const { token, user } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Your getMyIssues takes ONLY (token)
        const result = await getMyIssues(token);

        if (cancelled) return;

        setIssues(result);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load your issues.');
          setIssues([]);
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

  if (!token || !user) {
    return (
      <p className="text-sm text-slate-400">
        You must be signed in as a citizen to see your issues.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            My issues
          </h2>
          <p className="text-[11px] text-slate-400">
            Issues you have reported to the city.
          </p>
        </div>
        <div className="text-[11px] text-slate-400">
          {loading
            ? 'Loading…'
            : issues.length > 0
            ? `Total: ${issues.length}`
            : 'No issues reported yet'}
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-400 mb-2">
          {error}
        </p>
      )}

      {!loading && issues.length === 0 && !error && (
        <p className="text-xs text-slate-500">
          You haven’t reported any issues yet.
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
                <th className="text-left px-3 py-2 font-medium text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => {
                const canEdit = issue.status === 'OPEN';

                return (
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
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <Link
                            href={`/citizen/edit/${issue.id}`}
                            className="text-[10px] text-emerald-300 hover:text-emerald-200 underline"
                          >
                            Edit
                          </Link>
                        )}
                        {!canEdit && (
                          <span className="text-[10px] text-slate-500">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
