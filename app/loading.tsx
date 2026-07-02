import { NavSkeleton, PageHeadSkeleton, RowSkeleton, Skel } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <>
      <NavSkeleton />
      <main className="wrap">
        <PageHeadSkeleton />
        <Skel w={120} h={16} style={{ marginBottom: '.7rem' }} />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <div style={{ height: '1rem' }} />
        <Skel w={120} h={16} style={{ marginBottom: '.7rem' }} />
        <RowSkeleton />
        <RowSkeleton />
      </main>
    </>
  )
}
