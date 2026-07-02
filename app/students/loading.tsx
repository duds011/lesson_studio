import { NavSkeleton, PageHeadSkeleton, CardGridSkeleton } from '@/components/Skeleton'

export default function StudentsLoading() {
  return (
    <>
      <NavSkeleton />
      <main className="wrap">
        <PageHeadSkeleton />
        <CardGridSkeleton count={9} />
      </main>
    </>
  )
}
