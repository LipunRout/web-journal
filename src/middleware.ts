import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() validates the token with Supabase (getSession() only reads the cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path === '/admin' || path.startsWith('/admin/');

  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies on the redirect response.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (isAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', path);
    return redirectTo(url);
  }

  if (path === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return redirectTo(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
