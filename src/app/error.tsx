'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-page flex min-h-[70vh] flex-col items-start justify-center gap-4">
      <h1 className="display text-3xl sm:text-4xl">
        Something went <span className="display-accent">wrong</span>
      </h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-2">
        Try again
      </button>
    </main>
  );
}