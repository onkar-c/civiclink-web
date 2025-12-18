// civiclink-web/features/auth/types.ts
export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};
