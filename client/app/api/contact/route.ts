// app/api/contact/route.ts
import { NextResponse } from 'next/server'
import {sendEmail} from "../../../lib/gmail";

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const origin = new URL(req.url).origin

    await sendEmail({
      to: process.env.CONTACT_RECIPIENT || 'prodneumy@gmail.com',
      from: email,
      subject: `New contact from ${name}`,
      text: `Name: ${name}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g,'<br/>')}</p>`,
    }, origin)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.code === 'GMAIL_NOT_AUTHORIZED' ? 401 : 500
    return NextResponse.json({ ok: false, error: e?.friendlyMessage || e?.message || 'Failed to send email', authUrl: e?.authUrl }, { status })
  }
}
