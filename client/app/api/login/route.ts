import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken, AUTH_COOKIE } from '../../../lib/serverAuth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
    return NextResponse.json(
      { message: 'Server not configured' },
      { status: 500 }
    );
  }

  if (username !== ADMIN_USERNAME) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!match) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 3, // 3h
  });
  return res;
}
