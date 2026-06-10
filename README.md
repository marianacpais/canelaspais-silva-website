# Canelas Pais & Silva — Website

Static landing page for **Canelas Pais & Silva, Lda** (`www.canelaspais-silva.pt`).
Built from the brand design book (Floresta + Dourado palette, Sora typeface).

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page — HTML + CSS + JS, no build step |
| `favicon.svg` | The brand symbol (per-facet gradients), used as favicon |
| `functions/api/contact.js` | Cloudflare Pages Function backing the contact form (`POST /api/contact`) |

## Page structure

- **Hero** — the symbol builds piece by piece (**C → P → S**), the per-facet
  gradients light up with the gold glow, the full logo holds ~4 s, then loops.
  The whole build → hold → dissolve → rebuild cycle is pure CSS keyframes, so the
  loop seam lands on the blank frame (no flicker on restart).
- **Contact** — form (name, email, company, message) + details (email, address, web).
- **Footer** — legal name and NIPC.
- **PT/EN toggle** — switches all copy on the page.

## Run locally

It is static, so opening `index.html` in a browser shows the page. To also run
the contact Function locally, use Wrangler (it serves `functions/` too):

```sh
npx wrangler pages dev .
```

For local form testing, use the Turnstile **test keys** (always pass): sitekey
`1x00000000000000000000AA` in `index.html`, secret `1x0000000000000000000000000000000AA`
as `TURNSTILE_SECRET_KEY`.

## Deploy (Cloudflare Pages)

DNS for the domain is on Cloudflare, so the simplest deploy is **Cloudflare Pages**
(automatic HTTPS, native apex, no SSL configuration):

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick this repo.
2. Build settings: **Framework preset = None**, **Build command =** (empty),
   **Output directory =** `/` (the root — the site has no build).
3. After the first deploy: **Custom domains** → add `www.canelaspais-silva.pt`
   (and the apex `canelaspais-silva.pt` redirecting to `www`, or vice-versa).
   Cloudflare creates the DNS records and certificate automatically.

Every push to `main` redeploys automatically.

## Contact form setup

The form posts to the Cloudflare Pages Function at `/api/contact`, which:
1. verifies the **Turnstile** token server-side (privacy-friendly CAPTCHA, no
   user tracking), then
2. relays the message by email via **Resend**.

No third-party form service stores the submission — data only transits Cloudflare
(your own infra) and your email provider.

### One-time setup

1. **Turnstile** — Cloudflare dashboard → **Turnstile** → add a widget for
   `canelaspais-silva.pt`. You get a **sitekey** (public) and a **secret**.
   - Put the sitekey in `index.html` (replace `YOUR_TURNSTILE_SITEKEY`).
   - Put the secret in the Pages project env as `TURNSTILE_SECRET_KEY`.
2. **Resend** — create an account at [resend.com](https://resend.com), then
   **verify the domain** `canelaspais-silva.pt` (add the DNS records it gives you
   in Cloudflare — takes a couple of minutes). Create an API key.
   - Put the API key in the Pages project env as `RESEND_API_KEY`.
3. **Pages env vars** — in the Pages project → **Settings → Environment variables**,
   add (mark the secrets as encrypted):

   | Variable | Value |
   |---|---|
   | `TURNSTILE_SECRET_KEY` | Turnstile secret |
   | `RESEND_API_KEY` | Resend API key |
   | `CONTACT_TO` | *(optional)* recipient — default `info@canelaspais-silva.pt` |
   | `CONTACT_FROM` | *(optional)* verified sender — default `Website <site@canelaspais-silva.pt>` |

The visitor's email goes into the message's `reply_to`, so you can reply directly.

## Privacy / GDPR

The form collects name + email (personal data). A short privacy note sits next to
the submit button. Submissions are not stored by any third party; they are emailed
to you and kept only in your mailbox. If you later add a privacy policy page, link
it from that note.

## Accessibility

Respects `prefers-reduced-motion`: with it on, the logo appears already complete
and the build/loop does not run.
