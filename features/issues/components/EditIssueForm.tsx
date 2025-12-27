// civiclink-web/features/issues/components/EditIssueForm.tsx
'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getIssueById, updateIssue } from '@/features/issues/api';
import type { Issue, IssuePriority } from '@/features/issues/types';

type EditIssueFormProps = {
  issueId: string;
};

export function EditIssueForm({ issueId }: EditIssueFormProps) {
  const { token, user } = useAuth();
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks are all declared above – safe to guard now
  if (!token || !user) {
    return (
      <p className="text-sm text-slate-400">
        You must be signed in to edit an issue.
      </p>
    );
  }

  if (user.role !== 'CITIZEN') {
    return (
      <p className="text-sm text-slate-400">
        Only citizen accounts can edit their issues.
      </p>
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setInitialLoading(true);
      setError(null);

      try {
        const loaded = await getIssueById(token, issueId);
        if (cancelled) return;

        setIssue(loaded);
        setTitle(loaded.title);
        setDescription(loaded.description);
        setPriority(loaded.priority);
        setLatitude(
          loaded.latitude !== null && loaded.latitude !== undefined
            ? String(loaded.latitude)
            : '',
        );
        setLongitude(
          loaded.longitude !== null && loaded.longitude !== undefined
            ? String(loaded.longitude)
            : '',
        );
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load issue for editing.');
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, issueId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    // Require valid numeric lat/long, same rule as "new issue"
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError('Please enter valid numeric latitude and longitude.');
      return;
    }

    setSubmitting(true);

    try {
      await updateIssue(token, issueId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        latitude: lat,
        longitude: lng,
      });

      // After successful update, go back to citizen dashboard
      router.replace('/citizen');
    } catch (err: any) {
      setError(err.message || 'Failed to update issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (initialLoading) {
    return (
      <p className="text-sm text-slate-400">
        Loading issue details…
      </p>
    );
  }

  if (!issue) {
    return (
      <p className="text-sm text-slate-400">
        Issue not found or you do not have access to edit it.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm"
    >
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Title
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          placeholder="Short summary of the issue"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          rows={4}
          placeholder="Describe what’s happening so dispatchers can help."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as IssuePriority)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Latitude
          </label>
          <input
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
            placeholder="49.2827"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Longitude
          </label>
          <input
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
            placeholder="-123.1207"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
      >
        {submitting ? 'Saving changes…' : 'Save changes'}
      </button>
    </form>
  );
}
