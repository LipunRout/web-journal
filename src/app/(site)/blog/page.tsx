import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogCard, CARD_COLUMNS } from '@/components/blog/BlogCard';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'All posts',
  description: 'Browse every published article.',
};

const PAGE_SIZE = 12;

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = createServerSupabase();
  const { data: posts, count, error } = await supabase
    .from('posts')
    .select(CARD_COLUMNS, { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) throw new Error('Unable to load posts.');

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <main className="container-page py-16">
      <h1 className="display text-4xl sm:text-5xl">
        All <span className="display-accent">posts</span>
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Everything published on Web Journal, newest first.</p>

      {posts && posts.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-semibold">{page > 1 ? 'No posts on this page' : 'No posts published yet'}</p>
          <Link href={page > 1 ? '/blog' : '/admin/posts/new'} className="btn-primary mt-4">
            {page > 1 ? 'Back to first page' : 'Write a post'}
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-between">
          {page > 1 ? (
            <Link href={`/blog?page=${page - 1}`} className="btn-outline">Newer posts</Link>
          ) : (
            <span />
          )}
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          {page < totalPages ? (
            <Link href={`/blog?page=${page + 1}`} className="btn-outline">Older posts</Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}