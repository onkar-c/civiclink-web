// civiclink-web/features/users/api.ts
import { apiGet, apiPatch } from '@/lib/api';
import type { UserSummary, UserRole } from './types';

export type UsersQuery = {
  page?: number;
  pageSize?: number;
};

export type UsersListResult = {
  users: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getUsers(
  token: string | null,
  query: UsersQuery = {},
): Promise<UsersListResult> {
  if (!token) {
    return {
      users: [],
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

  const path = `/users?${params.toString()}`;

  // Normalize shape like we did for issues
  const raw = await apiGet<any>(path, token);

  let users: UserSummary[] = [];
  let total = 0;
  let rawPage = page;
  let rawPageSize = pageSize;

  if (Array.isArray(raw)) {
    users = raw as UserSummary[];
    total = raw.length;
  } else if (raw && Array.isArray(raw.data)) {
    users = raw.data as UserSummary[];
    total = typeof raw.total === 'number' ? raw.total : raw.data.length;
    rawPage = typeof raw.page === 'number' ? raw.page : page;
    rawPageSize =
      typeof raw.pageSize === 'number' ? raw.pageSize : pageSize;
  } else if (raw && Array.isArray(raw.items)) {
    users = raw.items as UserSummary[];
    total = typeof raw.total === 'number' ? raw.total : raw.items.length;
    rawPage = typeof raw.page === 'number' ? raw.page : page;
    rawPageSize =
      typeof raw.pageSize === 'number' ? raw.pageSize : pageSize;
  } else {
    users = [];
    total = 0;
  }

  return {
    users,
    total,
    page: rawPage,
    pageSize: rawPageSize,
  };
}

// Admin: update a user's role
export async function updateUserRole(
  token: string | null,
  userId: string,
  role: UserRole,
): Promise<void> {
  if (!token) {
    throw new Error('You must be logged in to update user roles.');
  }

  // Adjust this path if your backend uses a different route
  await apiPatch<void, { role: UserRole }>(
    `/users/${userId}/role`,
    { role },
    token,
  );
}
