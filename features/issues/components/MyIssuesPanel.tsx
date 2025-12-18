// civiclink-web/features/issues/components/MyIssuesPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMyIssues } from '../api';
import type { Issue } from '../types';

type MyIssuesPanelProps = {
  token: string | null;
};

export function MyIssuesPanel({ token }: MyIssuesPanelProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const selectedIssue =
    issues.find(issue => issue.id === selectedIssueId) ?? null;

  useEffect(() => {
    async function load() {
      if (!token) {
        setIssues([]);
        setSelectedIssueId(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getMyIssues(token);
        setIssues(data);
        if (data.length > 0) {
          setSelectedIssueId(data[0].id);
        } else {
          setSelectedIssueId(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load issues');
        setIssues([]);
        setSelectedIssueId(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
        Sign in to view your reported issues.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            My issues
          </h2>
          <p className="text-[11px] text-slate-400">
            Browse and inspect all issues you have reported.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            // simple refresh
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
              const data = await getMyIssues(token);
              setIssues(data);
              if (data.length > 0) {
                setSelectedIssueId(data[0].id);
              } else {
                setSelectedIssueId(null);
              }
            } catch (err: any) {
              setError(err.message || 'Failed to refresh issues');
            } finally {
              setLoading(false);
            }
          }}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-amber-400 mb-3">
          {error}
        </p>
      )}

      {issues.length === 0 && !loading && !error && (
        <p className="text-xs text-slate-500">
          You haven&apos;t reported any issues yet.
        </p>
      )}

      {issues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] gap-4">
          {/* Left: list */}
          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <ul className="divide-y divide-slate-800 text-[11px]">
              {issues.map(issue => {
                const isActive = issue.id === selectedIssueId;
                return (
                  <li
                    key={issue.id}
                    className={[
                      'cursor-pointer px-3 py-2 hover:bg-slate-900/80',
                      isActive ? 'bg-slate-900/90 border-l-2 border-emerald-500' : '',
                    ].join(' ')}
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-slate-100">
                          {issue.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-2">
                          {issue.description}
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-300">
                        {issue.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Priority: {issue.priority}</span>
                      <span>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: detail */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-[11px]">
            {selectedIssue ? (
              <>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {selectedIssue.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Created:{' '}
                      {new Date(
                        selectedIssue.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-300">
                      {selectedIssue.status}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-300">
                      Priority: {selectedIssue.priority}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-[11px] font-medium text-slate-300 mb-1">
                    Description
                  </div>
                  <p className="text-[11px] text-slate-200 whitespace-pre-line">
                    {selectedIssue.description}
                  </p>
                </div>

                {(selectedIssue.latitude != null ||
                  selectedIssue.longitude != null) && (
                  <div className="mb-3">
                    <div className="text-[11px] font-medium text-slate-300 mb-1">
                      Location
                    </div>
                    <p className="text-[11px] text-slate-200">
                      Latitude: {selectedIssue.latitude ?? '—'}, Longitude:{' '}
                      {selectedIssue.longitude ?? '—'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      (Later you can integrate a map preview here.)
                    </p>
                  </div>
                )}

                <div className="mt-4 text-[10px] text-slate-500">
                  This detail view is a placeholder for future enhancements
                  like status history, comments, and attachments.
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Select an issue from the list to see its details.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
