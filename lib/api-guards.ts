import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSessionFromToken } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin/auth';
import { headers } from 'next/headers';

/**
 * Auth guard for admin-only API routes.
 *
 * Supports three admin session formats:
 *  1. Full session JWT (lib/auth) with `role: 'ADMIN'` — checked via cookies or Bearer token.
 *  2. Lightweight admin JWT (lib/admin/auth) with `role: 'admin'` — checked via cookies.
 *
 * Either one is sufficient to access admin endpoints.
 */
export async function requireAdmin(request?: NextRequest) {
  // 1. Check Bearer token in Authorization header (useful for mobile apps)
  if (request) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const session = await getSessionFromToken(auth.slice(7));
      if (session && session.role === 'ADMIN') {
        return null;
      }
    }
  } else {
    // Fallback for when request is not passed (use headers() directly)
    const head = await headers();
    const auth = head.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const session = await getSessionFromToken(auth.slice(7));
      if (session && session.role === 'ADMIN') {
        return null;
      }
    }
  }

  // 2. Check cookies (regular session)
  const session = await getSession();
  if (session && session.role === 'ADMIN') {
    return null;
  }

  // 3. Check admin-specific cookie
  const isAdminCookie = await getAdminSession();
  if (isAdminCookie) {
    return null;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
