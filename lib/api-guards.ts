import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin/auth';

/**
 * Auth guard for admin-only API routes.
 *
 * Supports two admin session formats that coexist in the codebase:
 *  1. Full session JWT (lib/auth) with `role: 'ADMIN'` — used after
 *     regular admin login via /api/auth/* endpoints.
 *  2. Lightweight admin JWT (lib/admin/auth) with `role: 'admin'`
 *     — set by /api/admin/login (the password-only admin form).
 *
 * Either one is sufficient to access admin endpoints.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (session && session.role === 'ADMIN') {
    return null;
  }
  const isAdminCookie = await getAdminSession();
  if (isAdminCookie) {
    return null;
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
