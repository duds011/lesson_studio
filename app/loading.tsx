import Thinking from '@/components/portal/Thinking'
import { PageHeadSkeleton, RowSkeleton, Skel } from '@/components/Skeleton'

/**
 * The fallback for anything without a closer boundary — in practice the
 * Overview, which is the slowest page in the app because it talks to Google
 * Calendar as well as Supabase.
 *
 * It used to open with a `NavSkeleton`: a shimmer of the horizontal nav this
 * app had before the sidebar. That markup has no CSS left, so what actually
 * flashed up was a row of loose grey bars. The rail is drawn by the page
 * itself, so the wait now says only what it knows — that something is coming,
 * and roughly what shape it will be.
 */
export default function DashboardLoading() {
  return (
    <main className="wrap">
      <div style={{ display: 'grid', placeItems: 'center', padding: '4vh 0 5vh' }}>
        <Thinking size={64} label="Loading your workspace…" />
      </div>
      <PageHeadSkeleton />
      <Skel w={120} h={16} style={{ marginBottom: '.7rem' }} />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </main>
  )
}
