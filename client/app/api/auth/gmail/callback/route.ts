import { NextResponse } from 'next/server'
import {handleOAuthCallback} from "../../../../../lib/gmail";

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
  }

  try {
    const origin = url.origin
    await handleOAuthCallback(code, origin)
    // Redirect to a simple success JSON or page; here we return JSON
    return NextResponse.redirect(`${origin}/api/auth/gmail/status`)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'OAuth callback failed' }, { status: 500 })
  }
}
