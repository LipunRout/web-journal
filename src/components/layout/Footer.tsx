import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Articles on frontend, backend, cloud and AI, written by the people building them.
          </p>
        </div>
        <nav aria-label="Categories">
          <h2 className="text-sm font-semibold">Categories</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Site">
          <h2 className="text-sm font-semibold">Site</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/blog" className="hover:text-foreground">All posts</Link></li>
            <li><Link href="/admin/posts/new" className="hover:text-foreground">Write a post</Link></li>
            <li><Link href="/admin" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="container-page py-6 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Web Journal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
