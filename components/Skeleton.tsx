/** Shimmer loading skeletons shown during route transitions. */

export function Skel({ w, h = 14, r, style }: { w: number | string; h?: number; r?: boolean; style?: React.CSSProperties }) {
  return <span className={`skel ${r ? 'round' : ''}`} style={{ display: 'inline-block', width: w, height: h, ...style }} />
}

export function NavSkeleton() {
  return (
    <nav>
      <div className="nav-in">
        <span style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <Skel w={32} h={32} />
          <Skel w={110} h={16} />
        </span>
        <span style={{ display: 'flex', gap: '.5rem', flex: '1 1 auto' }}>
          <Skel w={82} h={30} r />
          <Skel w={74} h={30} r />
          <Skel w={70} h={30} r />
        </span>
        <Skel w={160} h={28} r />
      </div>
    </nav>
  )
}

export function PageHeadSkeleton() {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Skel w={90} h={22} r style={{ marginBottom: '.6rem' }} />
      <br />
      <Skel w={260} h={28} style={{ marginBottom: '.45rem' }} />
      <br />
      <Skel w={340} h={14} />
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="skel-card">
      <span style={{ flex: '0 0 84px' }}><Skel w={56} h={20} /></span>
      <span style={{ flex: '1 1 auto' }}>
        <Skel w="55%" h={16} style={{ marginBottom: 6 }} />
        <br />
        <Skel w="35%" h={12} />
      </span>
      <Skel w={110} h={34} r />
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="student-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skel-card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', gap: '.7rem', alignItems: 'center', marginBottom: '.9rem' }}>
            <Skel w={34} h={34} r />
            <span>
              <Skel w={140} h={15} style={{ marginBottom: 5 }} />
              <br />
              <Skel w={90} h={12} />
            </span>
          </div>
          <Skel w="70%" h={12} />
        </div>
      ))}
    </div>
  )
}
