import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { REMEMBER_COOKIE, isPersistent, sessionize } from './remember';

/**
 * Refreshes the Supabase auth session on every request and keeps the
 * auth cookies in sync between the request and the response.
 *
 * Private routes require a session. Missing auth configuration denies entry
 * unless an operator explicitly enables the public sample-data preview.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isProtected = /^\/(command|reach|crm|people|hire|finance|account|settings)(\/|$)/.test(request.nextUrl.pathname);
  const signInRedirect = () => {
    const target = new URL('/login', request.url);
    target.searchParams.set('notice', !url || !anonKey ? 'setup_required' : 'sign_in_required');
    const denied = NextResponse.redirect(target);
    denied.headers.set('Cache-Control', 'private, no-store');
    return denied;
  };
  if (!url || !anonKey) {
    if (isProtected && process.env.POWEROS_ALLOW_PUBLIC_PREVIEW !== '1') return signInRedirect();
    if (isProtected) supabaseResponse.headers.set('Cache-Control', 'private, no-store');
    return supabaseResponse;
  }

  let response = supabaseResponse;

  // Honour the user's "remember me" choice so a refreshed token keeps the same
  // cookie lifetime instead of silently becoming persistent again.
  const persist = isPersistent(request.cookies.get(REMEMBER_COOKIE)?.value);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, sessionize(options, persist)),
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and getUser().
  // getUser() revalidates the token and triggers a cookie refresh when needed.
  const { data: { user } } = await supabase.auth.getUser();
  if (isProtected && !user) {
    const denied = signInRedirect();
    response.cookies.getAll().forEach(cookie => denied.cookies.set(cookie));
    return denied;
  }
  if (isProtected) response.headers.set('Cache-Control', 'private, no-store');

  return response;
}
