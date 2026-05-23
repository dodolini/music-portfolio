import { google } from 'googleapis'
import type {OAuth2Client} from 'google-auth-library'
import { loadToken, saveToken, hasToken } from './tokenStore'

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.metadata'
]

function getOAuthClient(origin?: string): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const envRedirect = process.env.GMAIL_OAUTH_REDIRECT_URI
  const redirectUri = envRedirect || (origin ? `${origin}/api/auth/gmail/callback` : undefined)

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth configuration (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_OAUTH_REDIRECT_URI)')
  }

  const oAuth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
  })

  // Load stored token if available
  const token = loadToken()
  if (token) {
    oAuth2Client.setCredentials(token)
  }
  return oAuth2Client
}

export function getAuthUrl(origin?: string) {
  const oAuth2Client = getOAuthClient(origin)
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES,
  })
  return url
}

export async function handleOAuthCallback(code: string, origin?: string) {
  const oAuth2Client = getOAuthClient(origin)
  const { tokens } = await oAuth2Client.getToken(code)
  // Save refresh token (and access token)
  saveToken(tokens)
  oAuth2Client.setCredentials(tokens)
  return tokens
}

export type EmailAttachment = {
  filename: string
  content: Buffer | string
  mimeType?: string
}

export type SendEmailOptions = {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
  from?: string // optional override
}

function buildMessage(options: SendEmailOptions) {
  const from = options.from
  console.log(options)
  if (!from) throw new Error('GMAIL_SENDER must be set to a verified Gmail address')

  const boundary = `boundary_${Date.now()}`
  const headers: string[] = [
    `From: ${from}`,
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    'MIME-Version: 1.0',
  ]

  const hasAttachments = options.attachments && options.attachments.length > 0
  const hasHtml = !!options.html
  const hasText = !!options.text

  let body = ''

  if (hasAttachments) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
    const parts: string[] = []

    // Alternative part for text/html
    const altBoundary = `${boundary}_alt`
    const altParts: string[] = []
    if (hasText) {
      altParts.push(
        `--${altBoundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        options.text || '',
        ''
      )
    }
    if (hasHtml) {
      altParts.push(
        `--${altBoundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        '',
        options.html || '',
        ''
      )
    }
    altParts.push(`--${altBoundary}--`, '')

    parts.push(
      `--${boundary}`,
      `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
      '',
      altParts.join('\r\n')
    )

    for (const att of options.attachments!) {
      const content = typeof att.content === 'string' ? Buffer.from(att.content, 'base64') : att.content
      const mime = att.mimeType || 'application/octet-stream'
      parts.push(
        `--${boundary}`,
        `Content-Type: ${mime}; name="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${att.filename}"`,
        '',
        (typeof att.content === 'string' ? att.content : content.toString('base64')),
        ''
      )
    }

    parts.push(`--${boundary}--`, '')
    body = parts.join('\r\n')
  } else if (hasHtml) {
    headers.push('Content-Type: text/html; charset="UTF-8"')
    body = options.html || ''
  } else {
    headers.push('Content-Type: text/plain; charset="UTF-8"')
    body = options.text || ''
  }

  const raw = headers.join('\r\n') + '\r\n\r\n' + body
  const encodedMessage = Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return encodedMessage
}

export async function sendEmail(options: SendEmailOptions, origin?: string) {
  if (!hasToken()) {
    const initUrl = getAuthUrl(origin)
    const err: any = new Error('Gmail is not authorized. Visit the authorization URL to connect your Google account.')
    err.code = 'GMAIL_NOT_AUTHORIZED'
    err.authUrl = initUrl
    throw err
  }

  const auth = getOAuthClient(origin)
  const gmail = google.gmail({ version: 'v1', auth })

  const raw = buildMessage(options)

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    })
    return res.data
  } catch (e: any) {
    // Handle common error cases
    if (e?.code === 401 || e?.code === 403) {
      e.friendlyMessage = 'Authorization expired or missing required scope. Please reconnect your Google account.'
      e.authUrl = getAuthUrl(origin)
    }
    if (e?.errors?.[0]?.reason === 'rateLimitExceeded' || e?.code === 429) {
      e.friendlyMessage = 'Gmail API rate limit exceeded. Please try again later.'
    }
    throw e
  }
}
