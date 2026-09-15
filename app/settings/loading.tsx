import Thinking from '@/components/portal/Thinking'
import { PageHeadSkeleton, Skel } from '@/components/Skeleton'

/** Settings, waiting. See app/loading.tsx for why the nav skeleton went. */
export default function SettingsLoading() {
  return (
    <main className="wrap">
      <div style={{ display: 'grid', placeItems: 'center', padding: '4vh 0 5vh' }}>
        <Thinking size={64} label="Loading settings…" />
      </div>
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
  )
}
