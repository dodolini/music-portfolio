# Deploying NeumyBeats (free, single app on Vercel)

This project used to run as two processes: a Next.js frontend (`client/`) and an
Express backend (`server/`). For free hosting the backend has been **merged into
the Next.js app** as API route handlers, so you now deploy **one app to Vercel**.

**Stack**

| Piece            | Service                | Cost            |
| ---------------- | ---------------------- | --------------- |
| Web app + API    | Vercel                 | Free (Hobby)    |
| Database         | MongoDB Atlas          | Free (M0)       |
| File storage     | Cloudinary             | Free tier       |
| Contact emails   | Gmail API (optional)   | Free            |

> The `server/` folder is **no longer used** by the deployment. You can keep it
> for reference or delete it later (see step 8).

---

## What changed in the code

- All backend endpoints are now Next.js routes under `client/app/api/`:
  - `POST /api/login`, `POST /api/logout`
  - `GET/POST /api/beats`, `DELETE /api/beats/:id`, `POST /api/beats/:id/play`
  - `GET /api/cloudinary/sign` (signs direct browser uploads)
- Auth uses **HS256 + `JWT_SECRET`** (the old RS256 key files in `server/keys/`
  are no longer used).
- Uploaded beats/images go to **Cloudinary**. The admin panel uploads the file
  straight from the browser to Cloudinary (so large `.wav` files never hit
  Vercel's request-size limit), then saves the resulting URL in MongoDB.
- The client calls the API on the **same origin** (no more `localhost:4000`).

---

## Step 1 — MongoDB Atlas

You already have a cluster (`neumybeats`). Two things to set for production:

1. **Network access:** Atlas → *Network Access* → *Add IP Address* →
   **Allow Access from Anywhere** (`0.0.0.0/0`). Vercel's serverless functions
   don't have fixed IPs, so this is required.
2. **Rotate the password** (recommended — the old one was shared in plaintext).
   Atlas → *Database Access* → edit the user → *Edit Password* → generate a new
   one. Update your `MONGO_URI` accordingly.

Your connection string looks like:

```
mongodb+srv://USER:PASSWORD@neumybeats.setqawx.mongodb.net/neumybeats?retryWrites=true&w=majority
```

---

## Step 2 — Cloudinary

1. Create a free account at https://cloudinary.com.
2. On the dashboard, copy these three values:
   - **Cloud name**
   - **API Key**
   - **API Secret**

That's all the config needed — the app creates a `neumybeats/` folder
automatically. (Free tier allows files up to ~100 MB each, which is plenty for
beats.)

---

## Step 3 — Generate your admin secrets

From the `client/` folder (dependencies are already installed):

```bash
# A random JWT secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# A bcrypt hash of the admin password you want to use:
node -e "console.log(require('bcryptjs').hashSync('YOUR_ADMIN_PASSWORD', 10))"
```

Keep the outputs — they become `JWT_SECRET` and `ADMIN_PASSWORD_HASH`.

---

## Step 4 — Push to GitHub

```bash
git add .
git commit -m "Prepare app for single-app Vercel deployment"
git push
```

(`.env` files are gitignored, so your secrets are not pushed.)

---

## Step 5 — Import the project into Vercel

1. Go to https://vercel.com → **Add New… → Project** → import your GitHub repo.
2. **IMPORTANT — set the Root Directory to `client`.** Click *Edit* next to Root
   Directory and choose `client`. Vercel will then auto-detect Next.js.
3. Framework Preset: **Next.js** (auto). Leave build/output settings as default.

### Environment variables

Add these under **Settings → Environment Variables** (apply to Production,
Preview, and Development):

| Name                     | Value                                                |
| ------------------------ | ---------------------------------------------------- |
| `MONGO_URI`              | your Atlas connection string                          |
| `JWT_SECRET`             | from step 3                                            |
| `ADMIN_USERNAME`         | e.g. `neumy`                                           |
| `ADMIN_PASSWORD_HASH`    | bcrypt hash from step 3                                |
| `CLOUDINARY_CLOUD_NAME`  | from step 2                                            |
| `CLOUDINARY_API_KEY`     | from step 2                                            |
| `CLOUDINARY_API_SECRET`  | from step 2                                            |

Optional (contact form — see step 7):

| Name                       | Value                                              |
| -------------------------- | -------------------------------------------------- |
| `GOOGLE_CLIENT_ID`         | Google OAuth client id                             |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret                         |
| `GMAIL_OAUTH_REDIRECT_URI` | `https://YOUR-DOMAIN.vercel.app/api/auth/gmail/callback` |
| `CONTACT_RECIPIENT`        | where contact emails are delivered                 |
| `ENCRYPTION_SECRET`        | random string, min 32 chars                        |
| `GMAIL_REFRESH_TOKEN`      | (see step 7)                                        |

> ⚠️ For `ADMIN_PASSWORD_HASH` the bcrypt hash contains `$` characters. When
> pasting into Vercel's UI this is fine (paste as-is). Only escape `$` if you
> ever set it via the CLI / a shell.

---

## Step 6 — Deploy and test

Click **Deploy**. When it finishes:

1. Open `https://YOUR-DOMAIN.vercel.app/pl` → the homepage should load.
2. Go to `https://YOUR-DOMAIN.vercel.app/pl/panel-login` → log in with your
   admin username + password.
3. In the panel, add a beat (upload an audio file + cover image). It should
   appear on the homepage, served from Cloudinary.

> **Existing beats:** the two beats already in your database point at the old
> `/uploads/...` disk paths, which no longer exist. Delete them in the panel and
> re-upload so they get Cloudinary URLs.

---

## Step 7 — Contact form via Gmail (optional)

The contact form sends mail through the Gmail API using OAuth. On a serverless
host the token can't be stored on disk reliably, so do a one-time local
authorization and copy the refresh token into an env var.

1. In Google Cloud Console, add your production callback to the OAuth client's
   **Authorized redirect URIs**:
   `https://YOUR-DOMAIN.vercel.app/api/auth/gmail/callback`
2. Run the app locally (`cd client && npm run dev`) and visit
   `http://localhost:3000/api/auth/gmail/init` to authorize. This writes
   `client/.data/gmail-token.enc`.
3. Read the `refresh_token` from that flow (it's also printed by Google during
   consent) and set it on Vercel as `GMAIL_REFRESH_TOKEN`.

If you skip this, the rest of the site works fine — only the contact form is
affected.

---

## Step 8 — Security & cleanup

- **Remove the unused signing keys from git** (they were committed and are no
  longer used):
  ```bash
  git rm server/keys/private.key server/keys/public.key
  git commit -m "Remove unused JWT key files (switched to HS256)"
  ```
- **Rotate** any secret that was previously committed/shared in plaintext: the
  MongoDB password (step 1) and ideally `JWT_SECRET`.
- The `server/` folder and the root `package.json` dev scripts are no longer
  needed for deployment. You can delete `server/` once you're confident the new
  setup works.

---

## Local development

```bash
cd client
npm install      # first time only
npm run dev      # http://localhost:3000
```

`client/.env` holds your local values. Use `client/.env.example` as the template
for which variables are needed. You no longer need to run the Express server.

---

## Troubleshooting

- **Homepage 500 / "Missing MONGO_URI":** the env var isn't set on Vercel, or
  Atlas network access isn't open to `0.0.0.0/0`. Re-check step 1 and step 5.
- **Login always fails:** `ADMIN_PASSWORD_HASH` doesn't match the password, or
  `JWT_SECRET` is missing. Regenerate the hash (step 3) and redeploy.
- **Upload fails in the panel:** Cloudinary env vars are missing/incorrect, or
  you're not logged in (the signing endpoint requires the admin cookie).
- **Image won't display:** `next.config.ts` already allows `res.cloudinary.com`.
  If you use a different image host, add it to `images.remotePatterns`.
- **"Found multiple lockfiles" warning:** harmless. Vercel uses
  `client/package-lock.json` because the Root Directory is `client`.
