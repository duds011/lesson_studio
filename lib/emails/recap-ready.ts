import { appOrigin } from '@/lib/email'

/**
 * "Your recap is ready" — the only mail this app sends a student.
 *
 * Written to be worth opening on its own: the score, how much of the hour they
 * spoke, and a few words they met. A notification that says only "something is
 * ready, click here" trains people to stop clicking.
 *
 * Inline styles and a table for the button, because mail clients are not
 * browsers — Gmail strips <style> blocks and Outlook ignores CSS on <a>.
 * Everything degrades to readable text if the styling is dropped entirely.
 */
export type RecapEmailInput = {
  studentName: string
  teacherName: string
  /** The teacher's studio name — what the student knows them as. */
  portalName: string
  accent: string
  lessonTitle: string
  lessonDate: string
  score?: number | null
  talkPct?: number | null
  words: string[]
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  )

const prettyDate = (iso: string) => {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(d.getTime())
    ? String(iso)
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function recapReadySubject(i: RecapEmailInput): string {
  return `${i.lessonTitle} — your recap is ready`
}

export function recapReadyText(i: RecapEmailInput): string {
  const bits = [
    `Hi ${i.studentName},`,
    ``,
    `Your recap from ${prettyDate(i.lessonDate)} is ready: ${i.lessonTitle}.`,
  ]
  if (i.score != null) bits.push(`Score: ${i.score}/10`)
  if (i.talkPct != null) bits.push(`You spoke for ${i.talkPct}% of the lesson.`)
  if (i.words.length) bits.push(`Words from this lesson: ${i.words.join(', ')}`)
  bits.push(``, `Read it here: ${appOrigin()}/student/dashboard`, ``, `— ${i.teacherName}, ${i.portalName}`)
  return bits.join('\n')
}

export function recapReadyHtml(i: RecapEmailInput): string {
  const accent = /^#[0-9a-f]{6}$/i.test(i.accent) ? i.accent : '#0a61c9'
  const url = `${appOrigin()}/student/dashboard`

  const stat = (label: string, value: string) => `
    <td style="padding:0 8px 0 0;">
      <div style="border:1px solid #e6e6e0;border-radius:10px;padding:11px 13px;">
        <div style="font:600 11px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;letter-spacing:.06em;text-transform:uppercase;">${esc(label)}</div>
        <div style="font:700 20px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;margin-top:3px;">${esc(value)}</div>
      </div>
    </td>`

  const stats = [
    i.score != null ? stat('Score', `${i.score}/10`) : '',
    i.talkPct != null ? stat('You spoke', `${i.talkPct}%`) : '',
  ].filter(Boolean).join('')

  const words = i.words.length
    ? `<p style="font:600 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;margin:22px 0 8px;">Words from this lesson</p>
       <p style="margin:0;">${i.words
         .map(
           (w) =>
             `<span style="display:inline-block;border:1px solid #e6e6e0;border-radius:7px;padding:5px 9px;margin:0 5px 5px 0;font:600 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;">${esc(w)}</span>`,
         )
         .join('')}</p>`
    : ''

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f1ec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1ec;padding:28px 14px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

  <tr><td style="background:${accent};padding:18px 26px;">
    <span style="font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;">${esc(i.portalName)}</span>
  </td></tr>

  <tr><td style="padding:26px;">
    <p style="font:400 15px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;margin:0 0 6px;">Hi ${esc(i.studentName)},</p>
    <h1 style="font:700 22px/1.3 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;margin:0 0 4px;letter-spacing:-.02em;">${esc(i.lessonTitle)}</h1>
    <p style="font:400 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;margin:0 0 20px;">Your recap from ${esc(prettyDate(i.lessonDate))} is ready.</p>

    ${stats ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:4px;"><tr>${stats}</tr></table>` : ''}
    ${words}

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
      <tr><td style="background:${accent};border-radius:10px;">
        <a href="${esc(url)}" style="display:inline-block;padding:13px 26px;font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;text-decoration:none;">Read your recap</a>
      </td></tr>
    </table>

    <p style="font:400 13px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;margin:22px 0 0;">
      Vocabulary, corrections and practice from the lesson are all in there.<br>
      — ${esc(i.teacherName)}, ${esc(i.portalName)}
    </p>
  </td></tr>

  <tr><td style="padding:0 26px 24px;">
    <p style="font:400 11.5px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#9aa39e;margin:0;border-top:1px solid #eeeee8;padding-top:14px;">
      You are getting this because ${esc(i.teacherName)} publishes your lesson recaps to ${esc(i.portalName)}.
      Reply to this email to reach them directly.
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}
