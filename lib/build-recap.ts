import { getTranscript } from '@/lib/recall'
import { generateRecap } from '@/lib/openai'
import { getBots, getRecaps, saveRecap } from '@/lib/store'

export type BuildResult =
  | { ok: true; recap: any; talk: any; studentTalkPct: number | null }
  | { ok: false; error: string; status: number }

type Overrides = { studentName?: string; lessonDate?: string; lessonTitle?: string; attendees?: string[] }

/**
 * Build (or rebuild) a draft recap for a lesson from its Recall recording:
 * transcript → measured metrics → OpenAI → stored draft. Lesson metadata falls
 * back to the bot record / existing draft so the student linkage is preserved.
 */
export async function buildRecapDraft(eventId: string, overrides: Overrides = {}): Promise<BuildResult> {
  const bots = await getBots()
  const bot = bots[eventId]
  if (!bot) return { ok: false, error: 'No bot found for this lesson.', status: 404 }

  const prev = (await getRecaps())[eventId]
  const name = overrides.studentName || bot.studentName || prev?.studentName || 'Student'
  const date = overrides.lessonDate || bot.lessonDate || prev?.lessonDate
  const title = overrides.lessonTitle || bot.lessonTitle || prev?.lessonTitle
  const atts = (Array.isArray(overrides.attendees) && overrides.attendees.length ? overrides.attendees : bot.attendees) || prev?.attendees

  const t = await getTranscript(bot.botId)
  if (!t.plain.trim()) return { ok: false, error: 'Transcript is empty.', status: 422 }

  const recap: any = await generateRecap({ studentName: name, transcript: t.plain })
  if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
  // Measured Tier-1 fluency metrics (word timestamps). Vocab count stays the
  // model's estimate — raw JP token counting is unreliable.
  recap.metrics = t.metrics

  await saveRecap({
    eventId,
    studentName: name,
    recap,
    talk: t.talk,
    studentTalkPct: t.studentTalkPct,
    status: 'draft',
    createdAt: Date.now(),
    lessonDate: date || undefined,
    lessonTitle: title || undefined,
    attendees: Array.isArray(atts) ? atts : undefined,
  })

  return { ok: true, recap, talk: t.talk, studentTalkPct: t.studentTalkPct }
}
