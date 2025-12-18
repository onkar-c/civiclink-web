// civiclink-web/features/users/types.ts

export type UserRole = 'CITIZEN' | 'DISPATCHER' | 'ADMIN';

export type UserSummary = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
};
