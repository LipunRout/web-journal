import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '@/lib/categories';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, changeFrequency: 'daily', priority: 0.8 },
    ...CATEGORIES.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data } = await supabase.from('posts').select('slug, updated_at').eq('published', true);
    const posts: MetadataRoute.Sitemap = (data ?? []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      priority: 0.7,
    }));
    return [...staticEntries, ...posts];
  } catch {
    return staticEntries;
  }
}
