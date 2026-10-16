import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { categorySlug } from '@/lib/categories';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate, getInitials } from '@/lib/utils';

async function getPost(slug: string) {
  const supabase = createServerSupabase();
  // RLS returns published posts to everyone and drafts only to their author.
  const { data } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post || !post.published) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.created_at,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthor = user?.id === post.author_id;
  if (!post.published && !isAuthor) notFound();

  const author = post.author_name?.trim() || 'Web Journal';
  const slug = categorySlug(post.category);

  return (
    <main className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        {!post.published && (
          <p role="status" className="mb-8 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            This is a draft. Only you can see it.{' '}
            <Link href={`/admin/posts/${post.id}/edit`} className="font-semibold underline">
              Edit post
            </Link>
          </p>
        )}

        <header>
          {post.category &&
            (slug ? (
              <Link href={`/categories/${slug}`} className="chip hover:text-foreground">{post.category}</Link>
            ) : (
              <span className="chip">{post.category}</span>
            ))}
          <h1 className="display mt-4 text-4xl leading-[1.05] sm:text-5xl">{post.title}</h1>
          <p className="mt-5 font-serif text-xl leading-8 text-muted-foreground">{post.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {getInitials(author)}
            </span>
            <div className="text-sm leading-5">
              <p className="font-medium">{author}</p>
              <time dateTime={post.created_at} className="text-muted-foreground">{formatDate(post.created_at)}</time>
            </div>
          </div>
        </header>

        {post.cover_image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted">
            <Image src={post.cover_image} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="prose prose-lg mt-10 max-w-none font-serif dark:prose-invert prose-headings:font-sans prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl prose-pre:border prose-pre:bg-muted prose-pre:text-foreground">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-14 border-t pt-8">
          <Link href="/blog" className="btn-outline">Back to all posts</Link>
        </div>
      </article>
    </main>
  );
}