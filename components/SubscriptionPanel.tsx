import type { RecapUsage } from '@/lib/recap-quota'

/**
 * Settings → Subscription: which plan this account is on, how much of it is
 * used, and what the other plan costs. Billing isn't self-serve yet, so
 * switching is a prefilled email to the same address the privacy page names.
 */

const CONTACT = 'wogaoliveira@gmail.com'

const PLANS = [
  { id: 'starter', name: 'Starter', price: 27, recaps: 15, tag: 'Teaching on the side' },
  { id: 'studio', name: 'Studio', price: 45, recaps: 30, tag: 'For a full schedule' },
]

function planFor(limit: number) {
  return PLANS.find((p) => p.recaps === limit) ?? null
}

export default function SubscriptionPanel({ usage }: { usage: RecapUsage }) {
  const current = usage.trial ? null : planFor(usage.limit)
  const pct = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0

  return (
    <>
      <section className="k-sec" style={{ marginBottom: 18 }}>
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>💳</span>
          <div>
            <h3>Your plan</h3>
            <p className="desc">What this workspace runs on, and how much of this month is used.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <strong style={{ fontSize: 22, letterSpacing: '-.03em' }}>
            {usage.trial ? 'Free trial' : current ? current.name : `Custom · ${usage.limit} recaps`}
          </strong>
          {usage.trial ? (
            <span style={{ color: 'var(--muted)', fontWeight: 600 }}>
              {usage.limit} recaps on the house — see what a lesson turns into
            </span>
          ) : current ? (
            <span style={{ color: 'var(--muted)', fontWeight: 600 }}>
              ${current.price}/month · {current.recaps} recaps
            </span>
          ) : null}
        </div>

        <div style={{ maxWidth: 460 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
            <span>{usage.used} used</span>
            <span style={{ color: usage.left === 0 ? 'var(--red)' : 'var(--green)' }}>{usage.left} left</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 999,
                background: usage.left === 0 ? 'var(--red)' : 'var(--green)',
              }}
            />
          </div>
          <p className="desc" style={{ marginTop: 8 }}>
            A recap counts when it&rsquo;s built; reviewing, editing and re-sending are free.{' '}
            {usage.trial
              ? 'Trial recaps don’t renew — pick a plan below to keep going.'
              : 'The counter resets on the 1st of each month.'}
          </p>
        </div>
      </section>

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon b" aria-hidden>📦</span>
          <div>
            <h3>Plans</h3>
            <p className="desc">Both plans are the full Lesson Studio — the difference is recaps per month.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {PLANS.map((p) => {
            const isCurrent = current?.id === p.id
            return (
              <div
                key={p.id}
                style={{
                  border: isCurrent ? '2px solid var(--brand)' : '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  background: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <strong style={{ fontSize: 15 }}>{p.name}</strong>
                  {isCurrent ? (
                    <span className="pill" style={{ background: 'var(--brand)', color: '#fff' }}>Current plan</span>
                  ) : (
                    <span className="pill" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>{p.tag}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                  <strong style={{ fontSize: 26, letterSpacing: '-.03em' }}>${p.price}</strong>
                  <span style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>/month</span>
                </div>
                <p className="desc" style={{ marginBottom: isCurrent ? 0 : 12 }}>
                  {p.recaps} AI recaps a month · unlimited students &amp; portals
                </p>
                {!isCurrent && (
                  <a
                    className="btn btn-ghost btn-sm"
                    href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Switch my Lesson Studio plan to ${p.name}`)}`}
                  >
                    {usage.trial ? `Choose ${p.name}` : `Switch to ${p.name}`}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
