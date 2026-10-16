'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/lib/supabase/auth';
import { safeNextPath } from '@/lib/utils';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LoginCard() {
  const params = useSearchParams();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get('error') ?? '');
  const next = safeNextPath(params.get('next'));

  async function handleSignIn() {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle(next);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Google sign-in failed. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="surface w-full max-w-md p-8 shadow-xl shadow-primary/5 sm:p-10">
      <h1 className="display text-3xl">
        Sign <span className="display-accent">in</span>
      </h1>
      <p className="mt-2 text-muted-foreground">Use your Google account to write and manage your posts.</p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <button type="button" onClick={handleSignIn} disabled={busy} className="btn-outline mt-8 min-h-12 w-full gap-3 text-base">
        <GoogleIcon />
        {busy ? 'Redirecting to Google...' : 'Continue with Google'}
      </button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Just reading? You don&apos;t need an account.{' '}
        <Link href="/blog" className="font-medium text-foreground underline underline-offset-4">
          Browse posts
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container-page flex h-16 items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-24">
        <Suspense fallback={<div className="surface h-72 w-full max-w-md animate-pulse" />}>
          <LoginCard />
        </Suspense>
      </main>
    </div>
  );
}