import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Simple encrypted file token store. In production, prefer a secrets manager or database.
const DATA_DIR = path.join(process.cwd(), '.data')
const TOKEN_PATH = path.join(DATA_DIR, 'gmail-token.enc')

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || ''
  if (secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters long')
  }
  // Derive 32 bytes key using SHA-256
  return crypto.createHash('sha256').update(secret).digest()
}

export function saveToken(token: any) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const json = JSON.stringify(token)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  const payload = Buffer.concat([iv, tag, encrypted]).toString('base64')
  fs.writeFileSync(TOKEN_PATH, payload, { encoding: 'utf8' })
}

export function loadToken(): any | null {
  if (!fs.existsSync(TOKEN_PATH)) return null
  const key = getKey()
  const payload = fs.readFileSync(TOKEN_PATH, 'utf8')
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const enc = raw.subarray(28)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
  return JSON.parse(decrypted)
}

export function hasToken(): boolean {
  return fs.existsSync(TOKEN_PATH)
}

export function clearToken() {
  if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH)
}
