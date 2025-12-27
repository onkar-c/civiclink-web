// civiclink-web/features/auth/components/LoginForm.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginForm() {
  const { loginWithCredentials, initializing } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('secret123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginWithCredentials(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || initializing;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-xs font-medium text-slate-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-md hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {initializing
            ? 'Loading session…'
            : loading
            ? 'Signing in…'
            : 'Sign in'}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-xs text-amber-400">
          {error}
        </p>
      )}
    </div>
  );
}
