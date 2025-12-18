// civiclink-web/app/citizen/new/page.tsx
'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createIssue } from '@/features/issues/api';
import type { IssuePriority } from '@/features/issues/types';

export default function CitizenNewIssuePage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');

  // NEW: latitude & longitude as strings for inputs
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token || !user) {
    return (
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-2">Report a new issue</h1>
        <p className="text-sm text-slate-400">
          You must be signed in to report an issue.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!title.trim() || !description.trim()) {
        throw new Error('Title and description are required.');
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new Error('Please enter valid numeric latitude and longitude.');
      }

      await createIssue(token, {
        title: title.trim(),
        description: description.trim(),
        priority,
        latitude: lat,
        longitude: lng,
      });

      // On success, redirect back to citizen dashboard
      router.push('/citizen');
    } catch (err: any) {
      setError(err.message || 'Failed to create issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Report a new issue
        </h1>
        <p className="text-sm text-slate-400">
          Describe the problem so your city can investigate and resolve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <label
            htmlFor="title"
            className="text-xs font-medium text-slate-300"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Pothole on Main St near 5th Ave"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label
            htmlFor="description"
            className="text-xs font-medium text-slate-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            placeholder="Provide as many details as possible, including landmarks, time of day, and any safety concerns."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 resize-y"
          />
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <label
            htmlFor="priority"
            className="text-xs font-medium text-slate-300"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={e => setPriority(e.target.value as IssuePriority)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="LOW">Low – minor inconvenience</option>
            <option value="MEDIUM">Medium – needs attention</option>
            <option value="HIGH">High – urgent/safety-related</option>
          </select>
        </div>

        {/* Location: Latitude & Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="latitude"
              className="text-xs font-medium text-slate-300"
            >
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              placeholder="e.g. 49.2827"
              step="0.0001"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="longitude"
              className="text-xs font-medium text-slate-300"
            >
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              placeholder="e.g. -123.1207"
              step="0.0001"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-amber-400">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push('/citizen')}
            className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-4"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {submitting ? 'Submitting…' : 'Submit issue'}
          </button>
        </div>
      </form>
    </div>
  );
}
