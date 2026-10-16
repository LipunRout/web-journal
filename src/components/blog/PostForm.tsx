'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth';
import { CATEGORY_NAMES } from '@/lib/categories';
import { slugify } from '@/lib/utils';
import { postSchema } from '@/lib/validations/post';
import type { Post } from '@/types/database';
import { storagePathFromUrl } from './DeletePostButton';

const BUCKET = 'blog-images';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Errors = Partial<Record<'title' | 'slug' | 'description' | 'content' | 'category' | 'cover' | 'form', string>>;

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(post?.description ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [category, setCategory] = useState<string>(post?.category ?? '');
  const [published, setPublished] = useState(post?.published ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onFileChange(selected: File | null) {
    if (!selected) return setFile(null);
    if (!ALLOWED.includes(selected.type)) {
      setErrors((prev) => ({ ...prev, cover: 'Use a JPG, PNG, WebP or GIF image.' }));
      return;
    }
    if (selected.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, cover: 'Image must be 5 MB or smaller.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, cover: undefined }));
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!user) {
      setErrors({ form: 'Sign in to save your post.' });
      return;
    }

    const parsed = postSchema.safeParse({
      title,
      slug: slug || slugify(title) || `post-${Date.now().toString(36)}`,
      description,
      content,
      category,
      published,
    });

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSaving(true);
    let uploadedPath: string | null = null;

    try {
      let coverUrl = post?.cover_image ?? null;

      if (file) {
        const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
        uploadedPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(uploadedPath, file, {
          contentType: file.type,
          cacheControl: '31536000',
        });
        if (uploadError) throw uploadError;
        coverUrl = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
      }

      const fields = { ...parsed.data, cover_image: coverUrl };

      const result = post
        ? await supabase.from('posts').update(fields).eq('id', post.id).select('id').maybeSingle()
        : await supabase
            .from('posts')
            .insert({
              ...fields,
              author_id: user.id,
              author_name:
                (user.user_metadata?.full_name as string | undefined) ||
                (user.user_metadata?.name as string | undefined) ||
                user.email ||
                null,
            })
            .select('id')
            .maybeSingle();

      if (result.error) throw result.error;
      if (post && !result.data) throw new Error('You can only edit your own posts.');

      // Remove the previous cover once the new one is saved.
      if (post && file) {
        const oldPath = storagePathFromUrl(post.cover_image);
        if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
      const err = error as { code?: string; message?: string };
      if (err.code === '23505') {
        setErrors({ slug: 'That slug is already used. Choose another.' });
      } else {
        setErrors({ form: err.message || 'Could not save your post. Try again.' });
      }
      setSaving(false);
    }
  }

  const fieldError = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
        {errors[key]}
      </p>
    ) : null;

  const shownCover = preview ?? post?.cover_image ?? null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {errors.form && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      <div>
        <label htmlFor="title" className="label">Title</label>
        <input id="title" className="input" value={title} onChange={(e) => onTitleChange(e.target.value)} aria-describedby="title-error" maxLength={150} required />
        {fieldError('title')}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="slug" className="label">URL slug</label>
          <input
            id="slug"
            className="input font-mono text-[13px]"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="created-from-title"
            aria-describedby="slug-error"
          />
          <p className="hint">Your post will live at /blog/{slug || 'your-slug'}</p>
          {fieldError('slug')}
        </div>
        <div>
          <label htmlFor="category" className="label">Category</label>
          <select id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)} aria-describedby="category-error">
            <option value="">Choose a category</option>
            {CATEGORY_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {fieldError('category')}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">Summary</label>
        <textarea id="description" rows={2} className="input resize-none" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} aria-describedby="description-error" />
        <p className="hint">Shown on cards and in search results. {description.length}/300</p>
        {fieldError('description')}
      </div>

      <div>
        <label htmlFor="content" className="label">Content</label>
        <textarea id="content" rows={16} className="input font-mono text-[13px] leading-6" value={content} onChange={(e) => setContent(e.target.value)} aria-describedby="content-error" />
        <p className="hint">Markdown supported: headings, lists, links, code blocks and images.</p>
        {fieldError('content')}
      </div>

      <div>
        <span className="label">Cover image</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {shownCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownCover} alt="Cover preview" className="h-28 w-44 rounded-xl border object-cover" />
          ) : (
            <div className="flex h-28 w-44 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              <ImagePlus size={24} aria-hidden />
            </div>
          )}
          <div>
            <input
              id="cover"
              type="file"
              accept={ALLOWED.join(',')}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="focus-ring block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-muted/70"
              aria-label="Cover image"
            />
            <p className="hint">JPG, PNG, WebP or GIF, up to 5 MB.</p>
            {fieldError('cover')}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="focus-ring h-4 w-4 rounded border-input accent-[hsl(var(--primary))]" />
          Publish this post
          <span className="font-normal text-muted-foreground">{published ? '(visible to everyone)' : '(saved as draft)'}</span>
        </label>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-outline">Cancel</Link>
          <button type="submit" disabled={saving || isLoading} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : published ? 'Publish post' : 'Save draft'}
          </button>
        </div>
      </div>
    </form>
  );
}
