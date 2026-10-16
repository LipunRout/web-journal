import Link from 'next/link';
import { CARD_COLUMNS } from '@/components/blog/BlogCard';
import { LatestPostsGallery } from '@/components/blog/LatestPostsGallery';
import { CategoryTabs } from '@/components/blog/CategoryTabs';
import { HomeHero } from '@/components/layout/HomeHero';
import { EmailSignup } from '@/components/ui/EmailSignup';
import { CATEGORIES } from '@/lib/categories';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function HomePage({ searchParams }: { searchParams: { category?: string } }) {
  const selected = CATEGORIES.find((category) => category.slug === searchParams.category?.toLowerCase());
  const supabase = createServerSupabase();

  let query = supabase
    .from('posts')
    .select(CARD_COLUMNS)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (selected) query = query.eq('category', selected.name);

  const { data: posts, error } = await query;
  if (error) throw new Error('Unable to load posts.');

  return (
    <main>
      <HomeHero />

      <section id="latest" className="container-page scroll-mt-20 pt-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {selected ? `${selected.name} posts` : 'Latest posts'}
        </h2>
        <p className="mt-2 text-muted-foreground">Fresh articles from the community.</p>
        <div className="mt-6">
          <CategoryTabs selected={selected?.name} />
        </div>

        {posts && posts.length > 0 ? (
          <>
            <LatestPostsGallery key={selected?.slug ?? 'all'} posts={posts} />
            <div className="mt-10">
              <Link href={selected ? `/categories/${selected.slug}` : '/blog'} className="btn-outline">
                {selected ? `See all ${selected.name} posts` : 'See all posts'}
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
            <h3 className="text-lg font-semibold">
              {selected ? `Nothing in ${selected.name} yet` : 'No posts published yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {selected ? 'Try another category, or write the first one.' : 'Be the first to publish something.'}
            </p>
            <Link href="/admin/posts/new" className="btn-primary mt-5">
              Write a post
            </Link>
          </div>
        )}
      </section>

      <section className="container-page pt-24">
        <div className="surface flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight">Get new posts by email</h2>
            <p className="mt-3 text-muted-foreground">One email a week with the best new articles. Unsubscribe whenever you like.</p>
          </div>
          <EmailSignup />
        </div>
      </section>
    </main>
  );
}