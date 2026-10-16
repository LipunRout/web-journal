'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CardHandGallery, type FanCardItem } from '@/components/ui/card-hand-gallery';
import type { PostCardData } from '@/components/blog/BlogCard';

const fallbackImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="500" height="700" fill="url(#g)"/></svg>',
)}`;

export function LatestPostsGallery({ posts }: { posts: readonly PostCardData[] }) {
  const [activeId, setActiveId] = useState(posts[0]?.id);
  const activePost = posts.find((post) => post.id === activeId) ?? posts[0];
  const cards: FanCardItem[] = posts.map((post) => ({
    id: post.id,
    src: post.cover_image ?? fallbackImage,
    title: post.title,
    description: post.description || post.category || 'Read the latest from Web Journal.',
  }));

  return (
    <div className="mx-auto mt-8 max-w-6xl">
      <CardHandGallery cards={cards} activeId={activePost?.id} onSelect={(card) => setActiveId(card.id)} />
      {activePost && (
        <div className="mt-2 flex justify-center">
          <Link href={`/blog/${activePost.slug}`} className="btn-primary">
            Read this post
          </Link>
        </div>
      )}
    </div>
  );
}
