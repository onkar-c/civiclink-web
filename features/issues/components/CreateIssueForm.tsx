'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createIssue } from '@/features/issues/api';
import type { IssuePriority } from '@/features/issues/types';

export function CreateIssueForm() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hooks are already declared above – safe to guard here
  if (!token || !user || user.role !== 'CITIZEN') {
    // If you prefer a redirect instead, we can change this later
    return (
      <p className="text-sm text-slate-400">
        You must be logged in as a citizen to report an issue.
      </p>
    );
  }

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

     const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new Error('Please enter valid numeric latitude and longitude.');
      }


    setSubmitting(true);

    try {
      await createIssue(token, {
        title,
        description,
        priority,
        latitude: lat,
        longitude: lng,
      });

      // After creating, go back to citizen dashboard
      router.replace('/citizen');
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
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
          placeholder="Add more details so dispatchers can understand and prioritize."
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
            Latitude (optional)
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
            Longitude (optional)
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
        {submitting ? 'Submitting…' : 'Submit issue'}
      </button>
    </form>
  );
}
