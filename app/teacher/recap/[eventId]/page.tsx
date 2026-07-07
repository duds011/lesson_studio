import Link from 'next/link'
import { getToken, getRecaps } from '@/lib/store'
import AppNav from '@/components/AppNav'
import RecapReviewPage from '@/components/RecapReviewPage'
import type { DraftRecap } from '@/components/RecapReview'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { eventId: string } }) {
  const token = await getToken()
  const eventId = decodeURIComponent(params.eventId)
  const all = await getRecaps()
  const rec = all[eventId]

  if (!rec) {
    return (
      <>
        <AppNav email={token?.email} connected={Boolean(token)} />
        <main className="wrap page-fade">
          <div className="empty">
            This recap isn’t available anymore.{' '}
            <Link href="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>Back to overview</Link>
          </div>
        </main>
      </>
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

  return (
    <>
      <AppNav email={token?.email} connected={Boolean(token)} />
      <RecapReviewPage rec={draft} />
    </>
  )
}
