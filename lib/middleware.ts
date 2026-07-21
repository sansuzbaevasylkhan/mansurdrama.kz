import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, getSessionFromToken } from './auth';

const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN = '/admin/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin/* (but always allow the login page itself).
  if (!pathname.startsWith(ADMIN_PREFIX) || pathname === ADMIN_LOGIN || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionFromToken(token);

  if (!session || session.role !== 'ADMIN') {
    // API: return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page: redirect to login with a return URL
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
