import Thinking from '@/components/portal/Thinking'

/**
 * The wait between teacher tabs.
 *
 * Every page under /teacher is `force-dynamic` and reads Supabase before it can
 * render anything, so a tab takes a visible moment to arrive. Until now there
 * was no loading boundary anywhere under this segment: the router held the
 * previous page on screen, unchanged, for the whole of that moment, and the
 * click looked like it had missed.
 *
 * Sitting here rather than at the root means the sidebar is not part of what
 * gets replaced — the rail and the tab you just clicked stay put, and only the
 * page area waits.
 */
export default function TeacherTabLoading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '18vh 0 0', minHeight: '46vh' }}>
      <Thinking size={64} label="Loading…" />
    </div>
  )
}
