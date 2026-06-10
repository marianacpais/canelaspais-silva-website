// Cloudflare Pages Function — POST /api/contact
//
// Flow: verify the Turnstile token server-side, then relay the message by email
// via Resend. The submission is never stored by a third-party form service;
// data only transits Cloudflare (your infra) and your email provider.
//
// Required environment variables (set as secrets in the Pages project):
//   TURNSTILE_SECRET_KEY  — Turnstile secret (pairs with the public sitekey in index.html)
//   RESEND_API_KEY        — Resend API key
// Optional:
//   CONTACT_TO    — recipient (default: info@canelaspais-silva.pt)
//   CONTACT_FROM  — verified sender (default: "Website <site@canelaspais-silva.pt>")

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

const clean = (v, max) => (v == null ? '' : String(v)).trim().slice(0, max);

export async function onRequestPost(context) {
  const { request, env } = context;

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  // 1) Verify Turnstile
  const token = form.get('cf-turnstile-response');
  if (!token) return json({ error: 'captcha' }, 400);

  const verifyBody = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) verifyBody.set('remoteip', ip);

  let outcome;
  try {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyBody,
    });
    outcome = await verifyRes.json();
  } catch {
    return json({ error: 'verify_failed' }, 502);
  }
  if (!outcome.success) return json({ error: 'captcha' }, 400);

  // 2) Validate fields
  const nome = clean(form.get('nome'), 200);
  const email = clean(form.get('email'), 200);
  const empresa = clean(form.get('empresa'), 200);
  const mensagem = clean(form.get('mensagem'), 5000);

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!nome || !emailOk || !mensagem) return json({ error: 'invalid' }, 400);

  // 3) Relay via Resend
  const to = env.CONTACT_TO || 'info@canelaspais-silva.pt';
  const from = env.CONTACT_FROM || 'Website <site@canelaspais-silva.pt>';
  const text =
    `Nome: ${nome}\n` +
    `Email: ${email}\n` +
    `Empresa: ${empresa || '—'}\n\n` +
    `${mensagem}\n`;

  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Contacto do site — ${nome}`,
        text,
      }),
    });
    if (!sendRes.ok) return json({ error: 'send_failed' }, 502);
  } catch {
    return json({ error: 'send_failed' }, 502);
  }

  return json({ ok: true });
}

// Any non-POST method → 405 (onRequestPost above already handles POST)
export const onRequestGet = () => json({ error: 'method_not_allowed' }, 405);
