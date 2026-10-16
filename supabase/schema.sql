-- ============================================================
-- Blog platform schema. Run once in Supabase -> SQL Editor.
-- Safe to re-run (idempotent).
-- ============================================================

-- Shared helper ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles -----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row when a user signs up ---------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Posts --------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  content text not null,
  cover_image text,
  category text,
  author_id uuid not null references auth.users on delete cascade,
  author_name text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_listing_idx on public.posts (published, created_at desc);
create index if not exists posts_category_idx on public.posts (category) where published;

alter table public.posts enable row level security;

drop policy if exists "Anyone can read published posts" on public.posts;
create policy "Anyone can read published posts"
  on public.posts for select
  using (published = true);

drop policy if exists "Authors can read own posts" on public.posts;
create policy "Authors can read own posts"
  on public.posts for select to authenticated
  using ((select auth.uid()) = author_id);

drop policy if exists "Authors can insert own posts" on public.posts;
create policy "Authors can insert own posts"
  on public.posts for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "Authors can update own posts" on public.posts;
create policy "Authors can update own posts"
  on public.posts for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

drop policy if exists "Authors can delete own posts" on public.posts;
create policy "Authors can delete own posts"
  on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

-- Newsletter subscribers (insert-only for visitors) ------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint subscribers_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

alter table public.subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe"
  on public.subscribers for insert to anon, authenticated
  with check (true);

-- Storage: cover images ----------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images', 'blog-images', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public read for blog images" on storage.objects;
drop policy if exists "Authenticated users can upload blog images" on storage.objects;
drop policy if exists "Users can update own blog images" on storage.objects;
drop policy if exists "Users can delete own blog images" on storage.objects;
drop policy if exists "Users read own folder" on storage.objects;
drop policy if exists "Users upload to own folder" on storage.objects;
drop policy if exists "Users update own folder" on storage.objects;
drop policy if exists "Users delete own folder" on storage.objects;

-- Public URLs work without a select policy; this one only lets
-- signed-in users see (and delete) files in their own folder.
create policy "Users read own folder"
  on storage.objects for select to authenticated
  using (bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users upload to own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users update own folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text);
