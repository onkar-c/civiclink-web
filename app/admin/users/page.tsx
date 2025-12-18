// civiclink-web/app/admin/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getUsers,
  type UsersListResult,
  updateUserRole,
} from '@/features/users/api';
import type { UserSummary, UserRole } from '@/features/users/types';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Citizen', value: 'CITIZEN' },
  { label: 'Dispatcher', value: 'DISPATCHER' },
  { label: 'Admin', value: 'ADMIN' },
];

export default function AdminUsersPage() {
  // ✅ 1) Hooks at the top
  const { token, user, initializing } = useAuth();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page] = useState(1);
  const [pageSize] = useState(50);

  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // ✅ 2) Data loading hook – always declared, but does nothing when not admin
  useEffect(() => {
    if (!token || !user || user.role !== 'ADMIN') return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result: UsersListResult = await getUsers(token, {
          page,
          pageSize,
        });

        if (cancelled) return;

        setUsers(result.users);
        setTotal(result.total);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load users');
          setUsers([]);
          setTotal(0);
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
  }, [token, user, page, pageSize]);

  async function handleRoleChange(
    targetUser: UserSummary,
    newRole: UserRole,
  ) {
    if (!token) return;
    if (targetUser.role === newRole) return;

    setRowLoading(prev => ({ ...prev, [targetUser.id]: true }));
    setError(null);

    const previousUsers = [...users];

    // Optimistic update
    setUsers(current =>
      current.map(u =>
        u.id === targetUser.id ? { ...u, role: newRole } : u,
      ),
    );

    try {
      await updateUserRole(token, targetUser.id, newRole);
    } catch (err: any) {
      // rollback on error
      setUsers(previousUsers);
      setError(err.message || 'Failed to update user role');
    } finally {
      setRowLoading(prev => ({ ...prev, [targetUser.id]: false }));
    }
  }

  // ✅ 3) Auth / role guards AFTER hooks, no new hooks below

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-400">
          Loading CivicLink…
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-sm">
          <h1 className="text-lg font-semibold mb-2">User management</h1>
          <p className="text-slate-400">
            You must be signed in to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-sm">
          <h1 className="text-lg font-semibold mb-2">User management</h1>
          <p className="text-slate-400 mb-2">
            You are signed in as{' '}
            <span className="font-semibold">{user.role}</span>, but this
            page is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  // We know user is non-null and ADMIN here
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <div className="flex-1 flex flex-col px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">User management</h1>
            <p className="text-sm text-slate-400">
              View all registered users and manage their roles.
            </p>
          </div>
          <div className="text-xs text-slate-400 text-right">
            <div className="font-medium text-slate-100">
              {user.name || 'Administrator'}
            </div>
            <div>{user.email}</div>
            <div className="mt-1 inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
              {user.role}
            </div>
          </div>
        </header>

        <div className="mb-4 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {loading
              ? 'Loading users…'
              : total > 0
              ? `Showing ${users.length} of ${total} users`
              : 'No users found'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          {error && (
            <p className="text-xs text-amber-400 mb-2">
              {error}
            </p>
          )}

          {users.length === 0 && !loading && !error && (
            <p className="text-xs text-slate-500">
              No users to display.
            </p>
          )}

          {users.length > 0 && (
            <div className="max-h-[480px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full border-collapse text-[11px]">
                <thead className="bg-slate-900 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-slate-300">
                      Name
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-slate-300">
                      Email
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-slate-300">
                      Role
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-slate-300">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isRowBusy = rowLoading[u.id] ?? false;

                    return (
                      <tr
                        key={u.id}
                        className="border-t border-slate-800 hover:bg-slate-900/70"
                      >
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium text-slate-100">
                            {u.name || '—'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ID: {u.id}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top text-slate-200">
                          {u.email}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <select
                            value={u.role}
                            disabled={isRowBusy}
                            onChange={e =>
                              handleRoleChange(
                                u,
                                e.target.value as UserRole,
                              )
                            }
                            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {isRowBusy && (
                            <div className="mt-1 text-[10px] text-slate-500">
                              Updating…
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
