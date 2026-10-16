import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Pencil, Plus } from 'lucide-react';
import { DeletePostButton } from '@/components/blog/DeletePostButton';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false } };

export default async function AdminPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, published, created_at, cover_image')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  const posts = data ?? [];
  const publishedCount = posts.filter((post) => post.published).length;

  return (
    <main className="container-page py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
         <h1 className="display text-3xl sm:text-4xl">Your posts</h1>
          <p className="mt-2 text-muted-foreground">Write, edit and publish your articles.</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <Plus size={16} aria-hidden /> New post
        </Link>
      </div>

      <dl className="surface mt-8 grid grid-cols-3 divide-x text-center">
        {[
          ['Total', posts.length],
          ['Published', publishedCount],
          ['Drafts', posts.length - publishedCount],
        ].map(([label, value]) => (
          <div key={label} className="px-2 py-5 sm:py-6">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-destructive">
          We couldn&apos;t load your posts. Refresh the page to try again.
        </p>
      ) : posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-semibold">You haven&apos;t written anything yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your first post takes a few minutes.</p>
          <Link href="/admin/posts/new" className="btn-primary mt-4">Write your first post</Link>
        </div>
      ) : (
        <div className="surface mt-8 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Title</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Created</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="max-w-xs px-5 py-4 font-medium">
                    <Link href={`/blog/${post.slug}`} className="line-clamp-1 hover:text-primary">{post.title}</Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`chip ${post.published ? 'text-success' : 'text-warning'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDate(post.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/posts/${post.id}/edit`} className="btn-ghost h-9 min-h-9 px-3">
                        <Pencil size={14} aria-hidden /> Edit
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} coverImage={post.cover_image} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
