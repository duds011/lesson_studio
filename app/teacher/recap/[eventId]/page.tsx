import Link from 'next/link'
import { getRecaps } from '@/lib/store'
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

  return <RecapReviewPage rec={draft} />
}
