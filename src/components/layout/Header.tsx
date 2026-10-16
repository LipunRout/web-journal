'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, PenLine, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { getInitials } from '@/lib/utils';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
];

function Avatar({ name, src }: { name: string; src: string | null }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

export function Header() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [error, setError] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);

  const meta = user?.user_metadata ?? {};
  const name: string = (meta.full_name as string) || (meta.name as string) || user?.email || 'Account';
  const avatar = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : null;

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  async function handleSignIn() {
    setError('');
    try {
      await signInWithGoogle(pathname.startsWith('/admin') ? pathname : '/admin');
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Unable to sign in right now.');
    }
  }

  async function handleSignOut() {
    setError('');
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Unable to sign out right now.');
    }
  }

  const navLink = (href: string) =>
    `focus-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      (href === '/' ? pathname === '/' : pathname.startsWith(href))
        ? 'text-foreground'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLink(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/admin/posts/new" className="btn-outline">
            <PenLine size={16} aria-hidden /> Write
          </Link>
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
                className="btn-ghost gap-2 pl-1.5"
              >
                <Avatar name={name} src={avatar} />
                <span className="max-w-32 truncate">{name}</span>
                <ChevronDown size={14} aria-hidden />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-52 rounded-xl border bg-card p-1.5 shadow-lg">
                  <Link role="menuitem" href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                    <LayoutDashboard size={16} aria-hidden /> Dashboard
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <LogOut size={16} aria-hidden /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={handleSignIn} disabled={isLoading} className="btn-primary">
              Sign in
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="btn-ghost h-10 w-10 px-0"
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">
                {link.label}
              </Link>
            ))}
            <Link href="/admin/posts/new" className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">
              Write a post
            </Link>
            {user ? (
              <>
                <Link href="/admin" className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">
                  Dashboard
                </Link>
                <button type="button" onClick={handleSignOut} className="rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-muted">
                  Sign out ({name})
                </button>
              </>
            ) : (
              <button type="button" onClick={handleSignIn} disabled={isLoading} className="btn-primary mt-2">
                Sign in with Google
              </button>
            )}
          </nav>
        </div>
      )}

      {error && (
        <p role="alert" className="container-page pb-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </header>
  );
}
