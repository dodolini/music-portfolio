import { NextResponse } from 'next/server'
import { hasToken } from '../../../../../lib/tokenStore'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const authorized = hasToken()
    return NextResponse.json({ ok: true, authorized })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to read status' }, { status: 500 })
  }
}
