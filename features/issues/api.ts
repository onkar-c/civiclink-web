// civiclink-web/features/issues/api.ts
import { apiGet, apiPost, apiPatch  } from '@/lib/api';
import type {
  Issue,
  CreateIssuePayload,
  IssuePriority,
  UpdateIssuePayload
} from './types';

import type { IssueStatus } from './types';

// Citizen "My Issues"
export async function getMyIssues(token: string | null): Promise<Issue[]> {
  if (!token) {
    return [];
  }

  return apiGet<Issue[]>('/issues/mine', token);
}

export type IssuesQuery = {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: IssuePriority | 'ALL';
};

export type IssuesListResult = {
  issues: Issue[];
  total: number;
  page: number;
  pageSize: number;
};

// Dispatcher "All Issues" with filters
export async function getAllIssues(
  token: string | null,
  query: IssuesQuery = {},
): Promise<IssuesListResult> {
  if (!token) {
    return {
      issues: [],
      total: 0,
      page: 1,
      pageSize: query.pageSize ?? 20,
    };
  }

  const params = new URLSearchParams();

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  params.set('page', page.toString());
  params.set('pageSize', pageSize.toString());

  if (query.status && query.status !== 'ALL') {
    params.set('status', query.status);
  }

  if (query.priority && query.priority !== 'ALL') {
    params.set('priority', query.priority);
  }

  const path = `/issues?${params.toString()}`;

  // Use `any` here and normalize the shape
  const raw = await apiGet<any>(path, token);

  let issues: Issue[] = [];
  let total = 0;
  let rawPage = page;
  let rawPageSize = pageSize;

  if (Array.isArray(raw)) {
    // Backend returns plain array
    issues = raw as Issue[];
    total = raw.length;
  } else if (raw && Array.isArray(raw.data)) {
    // Backend shape: { data: Issue[], total, page, pageSize }
    issues = raw.data as Issue[];
    total = typeof raw.total === 'number' ? raw.total : raw.data.length;
    rawPage = typeof raw.page === 'number' ? raw.page : page;
    rawPageSize =
      typeof raw.pageSize === 'number' ? raw.pageSize : pageSize;
  } else if (raw && Array.isArray(raw.items)) {
    // Backend shape: { items: Issue[], total, page, pageSize }
    issues = raw.items as Issue[];
    total = typeof raw.total === 'number' ? raw.total : raw.items.length;
    rawPage = typeof raw.page === 'number' ? raw.page : page;
    rawPageSize =
      typeof raw.pageSize === 'number' ? raw.pageSize : pageSize;
  } else {
    // Unexpected shape – fallback: no issues
    issues = [];
    total = 0;
  }

  return {
    issues,
    total,
    page: rawPage,
    pageSize: rawPageSize,
  };
}

// Citizen "Create Issue"
export async function createIssue(
  token: string | null,
  payload: CreateIssuePayload,
): Promise<Issue> {
  if (!token) {
    throw new Error('You must be logged in to create an issue.');
  }

  return apiPost<Issue, CreateIssuePayload>('/issues', payload, token);
}



export async function updateIssueStatus(
  token: string | null,
  issueId: string,
  status: IssueStatus,
): Promise<void> {
  if (!token) {
    throw new Error('You must be logged in to update an issue.');
  }

  // Adjust this path if your backend uses a different route
  await apiPatch<void, { status: IssueStatus }>(
    `/issues/${issueId}/status`,
    { status },
    token,
  );
}


// Get a single issue by ID (for editing, etc.)
export async function getIssueById(
  token: string | null,
  issueId: string,
): Promise<Issue> {
  if (!token) {
    throw new Error('You must be logged in to view an issue.');
  }

  return apiGet<Issue>(`/issues/${issueId}`, token);
}

// Update an issue (citizen edit)
export async function updateIssue(
  token: string | null,
  issueId: string,
  data: UpdateIssuePayload,
): Promise<Issue> {
  if (!token) {
    throw new Error('You must be logged in to update an issue.');
  }

  return apiPatch<Issue, UpdateIssuePayload>(
    `/issues/${issueId}`,
    data,
    token,
  );
}