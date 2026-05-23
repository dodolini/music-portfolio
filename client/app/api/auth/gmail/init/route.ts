import { NextResponse } from 'next/server'
import {getAuthUrl} from "../../../../../lib/gmail";

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin
    const url = getAuthUrl(origin)
    return NextResponse.redirect(url)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to initiate Gmail OAuth' }, { status: 500 })
  }
}
