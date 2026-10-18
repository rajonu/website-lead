import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_TOKEN_VALUE } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') || '';

  // 1. Domain routing for live.d4f.me
  // If accessed via live.d4f.me and path is a direct slug (e.g. live.d4f.me/some-business)
  if (host.includes('live.d4f.me')) {
    if (
      pathname !== '/' &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/preview') &&
      !pathname.includes('.')
    ) {
      // Rewrite live.d4f.me/slug -> live.d4f.me/preview/slug
      const previewUrl = req.nextUrl.clone();
      previewUrl.pathname = `/preview${pathname}`;
      return NextResponse.rewrite(previewUrl);
    }
  }

  // 2. Allow all public routes without authentication
  const isPublicRoute =
    pathname.startsWith('/preview') ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/health' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt';

  if (isPublicRoute) {
    // If authenticated user tries to open /login, redirect to /
    if (pathname === '/login') {
      const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (authCookie === AUTH_TOKEN_VALUE) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    return NextResponse.next();
  }

  // 3. For all internal dashboard routes: enforce password authentication
  const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (authCookie !== AUTH_TOKEN_VALUE) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
