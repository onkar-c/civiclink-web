// civiclink-web/features/auth/api.ts
import { apiPost } from '@/lib/api';
import type { LoginResponse } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse, { email: string; password: string }>(
    '/auth/login',
    { email, password },
  );
}
