export const CATEGORY_NAMES = ["Trends", "Frontend", "Backend", "Cloud", "AI", "Tools"] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export const CATEGORIES = CATEGORY_NAMES.map((name) => ({
  name,
  slug: name.toLowerCase(),
}));

export const categoryBySlug = (slug: string) =>
  CATEGORIES.find((category) => category.slug === slug.toLowerCase());

export const categorySlug = (name: string | null | undefined) =>
  CATEGORIES.find((category) => category.name === name)?.slug;
