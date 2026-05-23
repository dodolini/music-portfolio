Gmail API integration – Setup Guide

Overview
This project sends emails using the official Gmail API via OAuth 2.0. No app passwords are used. A one‑time OAuth flow stores an encrypted refresh token on the server, and subsequent emails are sent using that token.

What you’ll set up
- A Google Cloud project
- OAuth consent screen
- OAuth 2.0 Client (Web application)
- Gmail API enabled
- Environment variables in .env
- Initial authorization using the /api/auth/gmail/init route

Prerequisites
- A Google account
- Access to Google Cloud Console
- Domain/host that can be used for OAuth redirect (localhost is fine for development)

Step 1 – Create a Google Cloud project
1. Open https://console.cloud.google.com/ and sign in.
2. Create a new project (or select an existing one).

Step 2 – Enable the Gmail API
1. In the Google Cloud Console, go to: APIs & Services → Library.
2. Search for "Gmail API" and click Enable.

Step 3 – Configure OAuth consent screen
1. Go to APIs & Services → OAuth consent screen.
2. Choose User Type: External (recommended if the account isn’t part of your organization) and click Create.
3. App details:
   - App name: your app name
   - User support email: your email
   - App domain: leave blank for local dev or fill for production
   - Authorized domains: add your domain (for production). For local dev, this can be skipped.
4. Scopes: Add the following scopes:
   - .../auth/gmail.send
   - .../auth/gmail.metadata
5. Test users (if app is in Testing mode): add the Google account(s) that will authorize the app.
6. Save.

Step 4 – Create OAuth 2.0 Client credentials
1. Go to APIs & Services → Credentials → Create Credentials → OAuth client ID.
2. Application type: Web application.
3. Name it e.g., "Gmail Web OAuth".
4. Authorized redirect URIs: add your callback route
   - For local dev with Next.js on port 3000: http://localhost:3000/api/auth/gmail/callback
   - For production: https://your-domain.tld/api/auth/gmail/callback
5. Click Create and copy the Client ID and Client Secret.

Step 5 – Environment variables (.env)
Create client/.env with the following variables:

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GMAIL_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
# Sender/recipient configuration
GMAIL_SENDER=your_gmail_address@gmail.com
# Optional: where contact emails should be delivered; defaults to GMAIL_SENDER when omitted
CONTACT_RECIPIENT=your_gmail_address@gmail.com
# 32+ characters; used to encrypt tokens at rest
ENCRYPTION_SECRET=change_this_to_a_long_random_string_at_least_32_chars

Notes
- GMAIL_SENDER must be the Gmail address of the Google account that authorizes the app (the account performing the OAuth flow). This is the account that actually sends emails (userId=me).
- CONTACT_RECIPIENT can be any email address you want to receive the contact messages at.
- ENCRYPTION_SECRET is used to encrypt the refresh token stored on disk. Keep it secret.

Step 6 – Install dependencies and run
From the client/ directory:
- npm install
- npm run dev

Step 7 – Authorize Gmail
1. Visit http://localhost:3000/api/auth/gmail/status. If authorized is false, you need to connect.
2. Visit http://localhost:3000/api/auth/gmail/init to start the OAuth flow.
3. Log in with the account specified by GMAIL_SENDER and grant access.
4. After successful consent, you’ll be redirected to /api/auth/gmail/status which should now show { authorized: true }.

Production considerations
- Set GMAIL_OAUTH_REDIRECT_URI to your production URL.
- Store ENCRYPTION_SECRET securely (e.g., hosting secrets manager).
- The encrypted token file is saved under .data/gmail-token.enc in the Next.js app working directory. Make sure the directory is writable by the server process and is not publicly served. Do not commit it to version control.
- Consider rotating tokens if compromised (delete the encrypted file and re‑authorize).
- If your app leaves Testing mode, follow Google’s verification process.

Troubleshooting
- 401/403 when sending: Reconnect using /api/auth/gmail/init, ensure scopes match and the correct account authorized.
- rateLimitExceeded / 429: You’ve hit Gmail API quota. Try again later or request higher quota in Google Cloud Console.
- invalid_grant on token exchange: Ensure redirect URI matches exactly and your consent screen is configured; also check time sync on server.

Security notes
- All credentials are provided via environment variables.
- Refresh tokens are encrypted at rest using AES‑256‑GCM.
- Only the Gmail send and metadata scopes are requested.
