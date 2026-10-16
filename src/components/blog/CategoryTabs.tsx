import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function CategoryTabs({ selected }: { selected?: string }) {
  const item = (active: boolean) =>
    `focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
    }`;

  return (
    <nav aria-label="Post categories" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        <li>
          <Link href="/#latest" aria-current={!selected ? 'page' : undefined} className={item(!selected)}>
            All
          </Link>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/?category=${category.slug}#latest`}
              aria-current={selected === category.name ? 'page' : undefined}
              className={item(selected === category.name)}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
