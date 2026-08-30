import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';
import { getUserById } from './lib/db';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(cookie);
  const user = userId !== null ? getUserById(userId) : undefined;

  if (!user || user.status !== 'approved') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    const response = NextResponse.redirect(url);
    if (cookie) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', String(user.id));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
