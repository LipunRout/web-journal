'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function EmailSignup({ id = 'newsletter-email' }: { id?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    const { error } = await supabase.from('subscribers').insert({ email: email.trim().toLowerCase() });

    // 23505 = already subscribed. Treat it as success so emails can't be probed.
    if (error && error.code !== '23505') {
      setStatus('error');
      setMessage(error.code === '23514' ? 'Enter a valid email address.' : 'Something went wrong. Try again in a moment.');
      return;
    }

    setStatus('done');
    setMessage('You are subscribed. New posts will land in your inbox.');
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md" noValidate={false}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== 'saving') setStatus('idle');
          }}
          placeholder="you@example.com"
          className="input"
        />
        <button type="submit" disabled={status === 'saving'} className="btn-primary shrink-0">
          {status === 'saving' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {message && (
        <p role="status" className={`mt-3 text-sm ${status === 'error' ? 'text-destructive' : 'text-success'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
