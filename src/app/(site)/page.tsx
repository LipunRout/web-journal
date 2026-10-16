import Link from 'next/link';
import { BlogCard, CARD_COLUMNS, Cover } from '@/components/blog/BlogCard';
import { CategoryTabs } from '@/components/blog/CategoryTabs';
import { EmailSignup } from '@/components/ui/EmailSignup';
import { CATEGORIES } from '@/lib/categories';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export default async function HomePage({ searchParams }: { searchParams: { category?: string } }) {
  const selected = CATEGORIES.find((category) => category.slug === searchParams.category?.toLowerCase());
  const supabase = createServerSupabase();

  const { data: featuredRows, error: featuredError } = await supabase
    .from('posts')
    .select(CARD_COLUMNS)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1);
  if (featuredError) throw new Error('Unable to load posts.');
  const featured = featuredRows?.[0];

  let query = supabase
    .from('posts')
    .select(CARD_COLUMNS)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (selected) query = query.eq('category', selected.name);
  else if (featured) query = query.neq('id', featured.id);

  const { data: posts, error } = await query;
  if (error) throw new Error('Unable to load posts.');

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-rise">
            <h1 className="display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Write about the web.
              <br />
              <span className="display-accent">Publish in minutes.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Sign in with Google, write in Markdown and your post goes live on a fast, readable page. Browse what other developers are building below.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admin/posts/new" className="btn-primary min-h-12 px-6 text-base">
                Start writing
              </Link>
              <Link href="/blog" className="btn-outline min-h-12 px-6 text-base">
                Read the blog
              </Link>
            </div>
          </div>

          {featured ? (
            <article className="surface group relative overflow-hidden shadow-xl shadow-primary/5">
              <div className="relative aspect-[16/10] bg-muted">
                <Cover post={featured} priority sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">Latest post</p>
                <h2 className="mt-2 text-2xl font-bold leading-snug tracking-tight">
                  <Link href={`/blog/${featured.slug}`} className="focus-ring rounded after:absolute after:inset-0 after:content-['']">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{featured.description}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {featured.author_name ?? 'Web Journal'}, {formatDate(featured.created_at)}
                </p>
              </div>
            </article>
          ) : (
            <div className="surface p-6 sm:p-8">
              <h2 className="text-xl font-bold tracking-tight">How it works</h2>
              <ol className="mt-5 space-y-5">
                {[
                  ['Sign in', 'Use your Google account. No password to set up.'],
                  ['Write', 'Draft in Markdown, add a cover image and pick a category.'],
                  ['Publish', 'Flip the switch and your post is live for everyone.'],
                ].map(([title, text], index) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      <section id="latest" className="container-page scroll-mt-20 pt-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="display text-3xl sm:text-4xl">
              {selected ? (
                <>
                  <span className="display-accent">{selected.name}</span> posts
                </>
              ) : (
                <>
                  Latest <span className="display-accent">posts</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-muted-foreground">Fresh articles from the community.</p>
          </div>
        </div>
        <div className="mt-6">
          <CategoryTabs selected={selected?.name} />
        </div>

        {posts && posts.length > 0 ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
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