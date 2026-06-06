import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const AUTH_COOKIE = 'auth_token';

/** Sign a short-lived admin session token (HS256, symmetric secret). */
export function signToken(username: string): string {
  if (!JWT_SECRET) throw new Error('Missing JWT_SECRET environment variable');
  return jwt.sign({ sub: username }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '3h',
  });
}

/** Returns the decoded payload if the request carries a valid auth cookie. */
export async function getSession(): Promise<jwt.JwtPayload | null> {
  if (!JWT_SECRET) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}
