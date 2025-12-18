// civiclink-web/features/issues/components/DispatcherIssuesPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Issue, IssueStatus } from '../types';
import {
  getAllIssues,
  type IssuesQuery,
  type IssuesListResult,
  updateIssueStatus,
} from '../api';

type DispatcherIssuesPanelProps = {
  token: string | null;
};

const STATUS_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const PRIORITY_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

const NEXT_STATUS_STEPS: Record<IssueStatus, IssueStatus[]> = {
  OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'CLOSED'],
  CLOSED: ['OPEN'],
};

export function DispatcherIssuesPanel({ token }: DispatcherIssuesPanelProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  async function loadIssues(overrides: Partial<IssuesQuery> = {}) {
    setLoading(true);
    setError(null);

    try {
      const result: IssuesListResult = await getAllIssues(token, {
        page,
        pageSize,
        status: statusFilter,
        priority: priorityFilter as any,
        ...overrides,
      });

      setIssues(result.issues);
      setTotal(result.total);
      setPage(result.page);
    } catch (err: any) {
      setError(err.message || 'Failed to load issues');
      setIssues([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, token]);

  const totalLabel =
    total > 0
      ? `Showing ${issues.length} of ${total} issues`
      : loading
      ? ''
      : 'No issues found';

  async function handleStatusChange(issue: Issue, newStatus: IssueStatus) {
    if (!token) return;

    setRowLoading(prev => ({ ...prev, [issue.id]: true }));
    setError(null);

    // Optimistic update: update in UI immediately
    const previousIssues = [...issues];
    setIssues(current =>
      current.map(i =>
        i.id === issue.id ? { ...i, status: newStatus } : i,
      ),
    );

    try {
      await updateIssueStatus(token, issue.id, newStatus);
      // success – nothing else to do, UI already updated
    } catch (err: any) {
      // rollback on error
      setIssues(previousIssues);
      setError(err.message || 'Failed to update issue status');
    } finally {
      setRowLoading(prev => ({ ...prev, [issue.id]: false }));
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 mt-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            All Issues (Dispatcher)
          </h2>
          <p className="text-[11px] text-slate-400">
            Filter, review, and update citizen-reported issues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadIssues()}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400">Priority</label>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          >
            {PRIORITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-[11px] text-slate-400">
          {totalLabel}
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-400 mb-2">
          {error}
        </p>
      )}

      {!loading && issues.length === 0 && !error && (
        <p className="text-xs text-slate-500">
          No issues found. Try adjusting filters or refresh.
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
                const isRowLoading = rowLoading[issue.id] ?? false;
                const nextStatuses = NEXT_STATUS_STEPS[issue.status];

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
                      <div className="flex flex-wrap gap-1">
                        {nextStatuses.map(s => (
                          <button
                            key={s}
                            type="button"
                            disabled={isRowLoading}
                            onClick={() =>
                              handleStatusChange(issue, s as IssueStatus)
                            }
                            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRowLoading ? 'Updating…' : `Set ${s}`}
                          </button>
                        ))}
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
