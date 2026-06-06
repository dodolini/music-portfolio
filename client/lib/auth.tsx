'use server';

// Re-exported for the server components / pages that guard the admin panel.
// Token verification now lives in lib/serverAuth (HS256 + JWT_SECRET).
import { isAuthenticated as check } from './serverAuth';

export async function isAuthenticated() {
  return check();
}
