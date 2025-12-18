// civiclink-web/features/auth/context/AuthContext.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import type { LoginResponse, User } from '../types';
import { login } from '../api';

type AuthState = {
  token: string | null;
  user: User | null;
  initializing: boolean;
};

type AuthContextValue = AuthState & {
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'civiclink_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

      if (raw) {
        const parsed = JSON.parse(raw) as LoginResponse;
        setToken(parsed.accessToken);
        setUser(parsed.user);
      }
    } catch {
      // ignore malformed storage
    } finally {
      setInitializing(false);
    }
  }, []);

  const persistAuth = useCallback((data: LoginResponse | null) => {
    if (typeof window === 'undefined') return;

    if (!data) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const res = await login(email, password);
      setToken(res.accessToken);
      setUser(res.user);
      persistAuth(res);
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistAuth(null);
  }, [persistAuth]);

  const value: AuthContextValue = useMemo(
    () => ({
      token,
      user,
      initializing,
      loginWithCredentials,
      logout,
    }),
    [token, user, initializing, loginWithCredentials, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
