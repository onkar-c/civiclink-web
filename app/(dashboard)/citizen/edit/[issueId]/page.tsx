// civiclink-web/app/(dashboard)/citizen/edit/[issueId]/page.tsx
import { EditIssueForm } from '@/features/issues/components/EditIssueForm';

interface CitizenEditIssuePageProps {
  // In your Next.js version, `params` is a Promise
  params: Promise<{ issueId: string }>;
}

export default async function CitizenEditIssuePage({
  params,
}: CitizenEditIssuePageProps) {
  const { issueId } = await params; // ✅ unwrap the promise

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:px-0 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Edit issue</h1>
        <p className="text-sm text-slate-400">
          Update details for this issue so dispatchers have the right context.
        </p>
      </div>

      <EditIssueForm issueId={issueId} />
    </div>
  );
}
