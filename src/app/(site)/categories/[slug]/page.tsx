import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogCard, CARD_COLUMNS } from '@/components/blog/BlogCard';
import { CATEGORIES, categoryBySlug } from '@/lib/categories';
import { createServerSupabase } from '@/lib/supabase/server';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const category = categoryBySlug(params.slug);
  return category ? { title: `${category.name} posts`, description: `Articles about ${category.name}.` } : {};
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categoryBySlug(params.slug);
  if (!category) notFound();

  const supabase = createServerSupabase();
  const { data: posts, error } = await supabase
    .from('posts')
    .select(CARD_COLUMNS)
    .eq('published', true)
    .eq('category', category.name)
    .order('created_at', { ascending: false })
    .limit(48);

  if (error) throw new Error('Unable to load posts.');

  return (
    <main className="container-page py-16">
      <h1 className="display text-4xl sm:text-5xl">
        Posts in <span className="display-accent">{category.name}</span>
      </h1>
      <ul className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/categories/${item.slug}`}
              aria-current={item.slug === category.slug ? 'page' : undefined}
              className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                item.slug === category.slug
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      {posts && posts.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-semibold">No {category.name} posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Check another category, or write the first one.</p>
          <Link href="/admin/posts/new" className="btn-primary mt-4">Write a post</Link>
        </div>
      )}
    </main>
  );
}