import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/types/database';
import { categorySlug } from '@/lib/categories';
import { formatDate, getInitials } from '@/lib/utils';

export const CARD_COLUMNS =
  'id, title, slug, description, cover_image, category, author_name, created_at' as const;

export type PostCardData = Pick<
  Post,
  'id' | 'title' | 'slug' | 'description' | 'cover_image' | 'category' | 'author_name' | 'created_at'
>;

export function Cover({ post, priority = false, sizes }: { post: PostCardData; priority?: boolean; sizes: string }) {
  if (post.cover_image) {
    return (
      <Image
        src={post.cover_image}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-muted">
      <span aria-hidden className="text-7xl font-extrabold tracking-tighter text-primary/40">
        {(post.category ?? post.title).slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}

export function BlogCard({ post }: { post: PostCardData }) {
  const author = post.author_name?.trim() || 'Web Journal';
  const slug = categorySlug(post.category);

  return (
    <article className="surface group relative flex flex-col overflow-hidden transition-colors hover:border-primary/50">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <Cover post={post} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.category &&
          (slug ? (
            <Link href={`/categories/${slug}`} className="chip relative z-10 w-fit hover:text-foreground">
              {post.category}
            </Link>
          ) : (
            <span className="chip w-fit">{post.category}</span>
          ))}
        <h3 className="mt-3 line-clamp-2 text-xl font-bold leading-snug tracking-tight">
          <Link href={`/blog/${post.slug}`} className="focus-ring rounded after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{post.description}</p>
        <div className="mt-5 flex items-center gap-3 border-t pt-4">
          <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {getInitials(author)}
          </span>
          <div className="min-w-0 text-sm leading-5">
            <p className="truncate font-medium">{author}</p>
            <time dateTime={post.created_at} className="text-muted-foreground">
              {formatDate(post.created_at)}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
}
