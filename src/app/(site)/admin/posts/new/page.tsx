import type { Metadata } from 'next';
import { PostForm } from '@/components/blog/PostForm';

export const metadata: Metadata = { title: 'New post', robots: { index: false } };

export default function NewPostPage() {
  return (
    <main className="container-page max-w-3xl py-12">
      <h1 className="display text-3xl sm:text-4xl">New post</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Save it as a draft, or publish it right away.</p>
      <PostForm />
    </main>
  );
}