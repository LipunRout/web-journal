import { z } from "zod";
import { CATEGORY_NAMES } from "@/lib/categories";

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title needs at least 3 characters").max(150, "Title is too long (150 max)"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug is too long (100 max)")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens"),
  description: z
    .string()
    .trim()
    .min(10, "Description needs at least 10 characters")
    .max(300, "Description is too long (300 max)"),
  content: z.string().trim().min(20, "Write at least 20 characters of content"),
  category: z.enum(CATEGORY_NAMES, { errorMap: () => ({ message: "Choose a category" }) }),
  published: z.boolean(),
});

export type PostInput = z.infer<typeof postSchema>;
