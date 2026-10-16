import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-page flex min-h-[70vh] flex-col items-start justify-center gap-4">
      <p className="text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="display text-4xl sm:text-5xl">
        We couldn&apos;t find <span className="display-accent">that page</span>
      </h1>
      <p className="max-w-md text-muted-foreground">
        The link may be broken, or the post may have been unpublished.
      </p>
      <Link href="/blog" className="btn-primary mt-2">
        Browse all posts
      </Link>
    </main>
  );
}