import { NavSkeleton, PageHeadSkeleton, Skel } from '@/components/Skeleton'

export default function SettingsLoading() {
  return (
    <>
      <NavSkeleton />
      <main className="wrap">
        <PageHeadSkeleton />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skel-card" style={{ display: 'block', padding: '1.4rem' }}>
            <Skel w={150} h={17} style={{ marginBottom: 8 }} />
            <br />
            <Skel w="60%" h={13} style={{ marginBottom: 14 }} />
            <br />
            <Skel w={190} h={36} r />
          </div>
        ))}
      </main>
    </>
  )
}
