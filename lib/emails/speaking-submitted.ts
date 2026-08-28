import { appOrigin } from '@/lib/email'

/**
 * "Your student recorded something" — the one mail this app sends a teacher.
 *
 * Debounced per lesson upstream, so a student who works through all three
 * speaking exercises in one sitting produces one message rather than three.
 * It names the sentence they were answering, because a teacher's first
 * question on seeing this is always "which one?".
 *
 * Same table-and-inline-styles rules as the student's recap mail — see
 * recap-ready.ts. Everything degrades to readable text if styling is stripped.
 */
export type SpeakingEmailInput = {
  teacherName: string
  studentName: string
  lessonTitle: string
  lessonNumber: number | null
  /** Deep link into the teacher's copy of this lesson. */
  lessonPath: string
  /** The prompts they answered, in the order the exercises appear. */
  prompts: string[]
  accent: string
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  )

const countPhrase = (n: number) => (n === 1 ? 'a speaking answer' : `${n} speaking answers`)

export function speakingSubmittedSubject(i: SpeakingEmailInput): string {
  return `${i.studentName} recorded ${countPhrase(i.prompts.length)}`
}

export function speakingSubmittedText(i: SpeakingEmailInput): string {
  const bits = [
    `Hi ${i.teacherName},`,
    ``,
    `${i.studentName} recorded ${countPhrase(i.prompts.length)} for ${i.lessonTitle}.`,
  ]
  if (i.prompts.length) {
    bits.push(``)
    for (const p of i.prompts) bits.push(`· ${p}`)
  }
  bits.push(``, `Listen here: ${appOrigin()}${i.lessonPath}`, ``, `— Lesson Studio`)
  return bits.join('\n')
}

export function speakingSubmittedHtml(i: SpeakingEmailInput): string {
  const accent = /^#[0-9a-f]{6}$/i.test(i.accent) ? i.accent : '#0a61c9'
  const url = `${appOrigin()}${i.lessonPath}`

  const prompts = i.prompts.length
    ? `<p style="font:600 11px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;letter-spacing:.06em;text-transform:uppercase;margin:22px 0 8px;">What they answered</p>
       ${i.prompts
         .map(
           (p) =>
             `<div style="border:1px solid #e6e6e0;border-radius:10px;padding:11px 13px;margin:0 0 7px;font:400 14px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;">${esc(p)}</div>`,
         )
         .join('')}`
    : ''

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f1ec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1ec;padding:28px 14px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

  <tr><td style="background:${accent};padding:18px 26px;">
    <span style="font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;">Lesson Studio</span>
  </td></tr>

  <tr><td style="padding:26px;">
    <p style="font:400 15px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;margin:0 0 6px;">Hi ${esc(i.teacherName)},</p>
    <h1 style="font:700 22px/1.3 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16211b;margin:0 0 4px;letter-spacing:-.02em;">${esc(i.studentName)} recorded ${esc(countPhrase(i.prompts.length))}</h1>
    <p style="font:400 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;margin:0 0 20px;">${i.lessonNumber != null ? `Lesson ${i.lessonNumber} · ` : ''}${esc(i.lessonTitle)}</p>

    ${prompts}

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
      <tr><td style="background:${accent};border-radius:10px;">
        <a href="${esc(url)}" style="display:inline-block;padding:13px 26px;font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;text-decoration:none;">Listen to it</a>
      </td></tr>
    </table>

    <p style="font:400 13px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b7671;margin:22px 0 0;">
      It is on the lesson's Practice tab, under the exercise they were answering.
    </p>
  </td></tr>

  <tr><td style="padding:0 26px 24px;">
    <p style="font:400 11.5px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#9aa39e;margin:0;border-top:1px solid #eeeee8;padding-top:14px;">
      You are getting this because your students can record the speaking exercises.
      Turn that off in Settings → Student portal.
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}
