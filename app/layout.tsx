import type { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AppHeader } from '@/components/AppHeader';

export const metadata = {
  title: 'CivicLink',
  description: 'Civic issue reporting and management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 px-4 py-4 md:px-8 md:py-6">
              <div className="mx-auto max-w-6xl">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
