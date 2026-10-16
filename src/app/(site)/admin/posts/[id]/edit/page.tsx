import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PostForm } from '@/components/blog/PostForm';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Edit post', robots: { index: false } };

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/admin/posts/${params.id}/edit`);

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('author_id', user.id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <main className="container-page max-w-3xl py-12">
      <h1 className="display text-3xl sm:text-4xl">Edit post</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Changes go live as soon as you save.</p>
      <PostForm post={post} />
    </main>
  );
}
