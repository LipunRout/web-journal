import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight">
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground"
      >
        W
      </span>
      Web Journal
    </Link>
  );
}
