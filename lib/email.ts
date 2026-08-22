/**
 * Sending mail, through Resend.
 *
 * Written against the REST API with fetch rather than the SDK: one POST is the
 * whole surface we use, and a dependency that ships its own fetch polyfill is
 * not worth carrying for it.
 *
 * Every caller treats a failure here as non-fatal. Mail is a courtesy on top of
 * work that has already succeeded — a recap that reached the student's portal
 * but whose notification bounced is still a delivered recap, and must never be
 * reported as a failed publish.
 */
const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

/** Where notifications come from. Must be on a domain verified in Resend. */
export function fromAddress(): string {
  return clean(process.env.RECAP_FROM_EMAIL) || 'Lesson Studio <recaps@koku-library.app>'
}

/** The app's public origin, for links inside mail (there is no request here). */
export function appOrigin(): string {
  return (clean(process.env.PUBLIC_APP_URL) || 'https://koku-library.app').replace(/\/+$/, '')
}

export function isEmailConfigured(): boolean {
  return Boolean(clean(process.env.RESEND_API_KEY))
}

export type SendResult = { sent: true; id: string } | { sent: false; reason: string }

/**
 * `from` carries a display name so the student sees their teacher's studio
 * rather than ours, and `replyTo` is the teacher — a student who answers the
 * notification should reach the person who taught them, not a mailbox nobody
 * reads.
 */
export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}): Promise<SendResult> {
  const key = clean(process.env.RESEND_API_KEY)
  if (!key) return { sent: false, reason: 'RESEND_API_KEY is not set' }

  const to = clean(opts.to)
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return { sent: false, reason: `Not a sendable address: ${to || '(empty)'}` }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: opts.from || fromAddress(),
        to: [to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { reply_to: [opts.replyTo] } : {}),
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      // Resend's own message is the useful part (unverified domain, bad
      // address, rate limit) and it goes to the log, never to a teacher.
      return { sent: false, reason: `Resend ${res.status}: ${(body as any)?.message ?? 'unknown error'}` }
    }
    return { sent: true, id: String((body as any)?.id ?? '') }
  } catch (e: any) {
    return { sent: false, reason: e?.message || 'Network error' }
  }
}
