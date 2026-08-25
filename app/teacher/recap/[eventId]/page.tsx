import Link from 'next/link'
import { getRecaps } from '@/lib/store'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import RecapReviewPage from '@/components/RecapReviewPage'
import type { DraftRecap } from '@/components/RecapReview'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { eventId: string } }) {
  const eventId = decodeURIComponent(params.eventId)
  const all = await getRecaps()
  const rec = all[eventId]

  if (!rec) {
    return (
      <div className="empty">
        This recap isn’t available anymore.{' '}
        <Link href="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>Back to overview</Link>
      </div>
    )
  }

  const draft: DraftRecap = {
    eventId: rec.eventId,
    studentName: rec.studentName,
    status: rec.status,
    recap: rec.recap,
    lessonDate: rec.lessonDate,
    lessonTitle: rec.lessonTitle,
  }

  // The student's learning language, for the language-aware bits of the
  // review (hesitation examples). Cosmetic, so any miss just means the
  // neutral caption — but the row is still checked against the signed-in
  // teacher before it is used.
  let language: string | null = null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: link } = await createAdminClient()
      .from('lesson_event_links')
      .select('teacher_id, students ( language )')
      .eq('event_id', eventId)
      .maybeSingle()
    const s = Array.isArray((link as any)?.students) ? (link as any).students[0] : (link as any)?.students
    if ((link as any)?.teacher_id === user.id) language = s?.language ?? null
  }

  return <RecapReviewPage rec={draft} language={language} />
}
