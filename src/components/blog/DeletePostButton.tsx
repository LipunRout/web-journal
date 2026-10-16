'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const BUCKET = 'blog-images';

export function storagePathFromUrl(url: string | null) {
  if (!url) return null;
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

export function DeletePostButton({ id, title, coverImage }: { id: string; title: string; coverImage: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setBusy(true);
    setError('');

    const { error: deleteError } = await supabase.from('posts').delete().eq('id', id);
    if (deleteError) {
      setBusy(false);
      setError('Could not delete this post. Try again.');
      return;
    }

    const path = storagePathFromUrl(coverImage);
    if (path) await supabase.storage.from(BUCKET).remove([path]);

    setBusy(false);
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button type="button" onClick={handleDelete} disabled={busy} className="btn-danger h-9 min-h-9 px-3">
        <Trash2 size={14} aria-hidden /> {busy ? 'Deleting...' : 'Delete'}
      </button>
      {error && (
        <span role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
