# Web Journal

Blog platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS and Supabase.
Anyone can read posts. Signing in with Google lets you write, edit, publish and delete your own posts.
Light and dark mode follow the system setting and can be toggled from the header.

## Setup

1. **Install**
   ```bash
   npm install
   ```
2. **Environment**: copy `.env.example` to `.env.local` and fill in your Supabase URL and publishable key.
3. **Database**: open Supabase, go to SQL Editor, paste `supabase/schema.sql` and run it.
   It creates `profiles`, `posts`, `subscribers`, the `blog-images` storage bucket, triggers and RLS policies. It is safe to re-run.
4. **Google sign-in**: Supabase, Authentication, Providers, Google: enable it and add your Google Client ID and Secret.
5. **Redirect URLs**: Supabase, Authentication, URL Configuration:
   - Site URL: `http://localhost:3000` (use your Vercel URL in production)
   - Redirect URLs: `http://localhost:3000/**` and `https://YOUR-DOMAIN/**`
   The wildcard matters: the app redirects to `/auth/callback?next=...`.
6. **Run**
   ```bash
   npm run dev
   ```

## Deploy (Vercel)

Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL` in Project Settings, then deploy.
Add your production URL to the Supabase redirect list (step 5).

## Structure

```
src/app/(site)/        pages with header + footer (home, blog, categories, admin)
src/app/(auth)/login   Google sign-in page
src/app/auth/callback  OAuth code exchange
src/components/        layout, blog and ui components
src/lib/supabase/      browser client, server client, auth provider
src/middleware.ts      protects /admin, refreshes the session
supabase/schema.sql    tables, RLS, storage
```

## Notes

- Post content is Markdown, rendered without raw HTML, so it is safe to display.
- Categories live in `src/lib/categories.ts`. Edit that one list to change the tabs, the editor and the category pages.
- Types in `src/types/database.ts` are hand-written. Regenerate them with `npx supabase gen types typescript --project-id <id> > src/types/database.ts` after schema changes.
