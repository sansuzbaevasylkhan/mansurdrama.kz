import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { SessionPayload, UserRole } from '@/types';

const COOKIE_NAME = 'mansur_admin_session';
const ALG = 'HS256';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET environment variable must be set (at least 16 chars).');
  }
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/**
 * Find (or create) the single admin account using the password from env.
 * This keeps the simple "single admin password" model from the spec.
 */
export async function authenticateAdmin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is not set.');
  }
  if (password !== adminPassword) {
    return null;
  }
  // Make sure at least one ADMIN user exists in the DB.
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@mansurdrama.kz',
        name: 'Admin',
        role: 'ADMIN' as UserRole,
        password: await hashPassword(adminPassword),
      },
    });
  }
  return admin;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    return payloadToSession(payload);
  } catch {
    return null;
  }
}

function payloadToSession(payload: JWTPayload): SessionPayload | null {
  if (
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.name === 'string' &&
    (payload.role === 'ADMIN' || payload.role === 'USER')
  ) {
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
  return null;
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  // Алдымен админ cookie, болмаса пайдаланушы cookie
  const token =
    store.get(COOKIE_NAME)?.value ?? store.get('user_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(
  token: string,
  cookieName: string = COOKIE_NAME,
) {
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(
  cookieName: string = COOKIE_NAME,
) {
  const store = await cookies();
  store.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Reads the session token from a NextRequest (for middleware / route handlers).
 */
export async function getSessionFromToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  return verifySessionToken(token);
}
