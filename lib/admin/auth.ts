import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "mansurdrama-super-secret-jwt-key-2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mansurdrama";

export const ADMIN_COOKIE = "mansur_admin_session";
export const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export async function signAdminSession(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function setAdminCookie() {
  const token = await signAdminSession();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
  return token;
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return await verifyAdminSession(token);
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export function checkAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
