'use client';

import { CreateIssueForm } from '@/features/issues/components/CreateIssueForm';

export default function CitizenNewIssuePage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold">Report a new issue</h1>
        <p className="text-sm text-slate-400">
          Provide details so dispatchers can review and take action.
        </p>
      </header>

      <CreateIssueForm />
    </div>
  );
}
