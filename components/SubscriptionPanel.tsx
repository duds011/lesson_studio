import type { RecapUsage } from '@/lib/recap-quota'
import { PLANS, TOPUP, planById, planForLimit } from '@/lib/plans'
import BillingButton from '@/components/BillingButton'

/**
 * Settings → Subscription: which plan this account is on, how much of it is
 * used, and what the others cost. Every button here goes to Stripe — plans and
 * top-ups through Checkout, everything else (card, invoices, cancelling)
 * through Stripe's own billing portal.
 *
 * A grandfathered account is shown its real plan by name and is never nudged
 * to "upgrade" to something smaller: the plan list below hides any tier whose
 * allowance is lower than the one they already hold.
 */

export default function SubscriptionPanel({
  usage,
  planId,
  hasBilling,
}: {
  usage: RecapUsage
  /** profiles.plan_id — authoritative; the allowance is only the fallback. */
  planId?: string | null
  /** Has a Stripe customer, so the billing portal has something to show. */
  hasBilling?: boolean
}) {
  const current = usage.trial ? null : planById(planId) ?? planForLimit(usage.limit)
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
            {usage.extra > 0 && (
              <> You also hold <strong>{usage.extra} extra recap{usage.extra === 1 ? '' : 's'}</strong> —
              they never expire and are only spent after the month&rsquo;s allowance.</>
            )}
          </p>
        </div>
      </section>

      {/* Top-ups: for the month that ran long. Priced above every plan's
          per-recap rate on purpose — recurring need should upgrade instead. */}
      {!usage.trial && (
        <section className="k-sec" style={{ marginBottom: 18 }}>
          <div className="k-sec-head">
            <span className="k-sec-icon" aria-hidden>➕</span>
            <div>
              <h3>Need a few more this month?</h3>
              <p className="desc">Top-ups never expire, and are only spent after your plan&rsquo;s monthly recaps.</p>
            </div>
          </div>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
              border: '1px solid var(--line)', borderRadius: 14, padding: '14px 18px', background: 'var(--surface)',
            }}
          >
            <div>
              <strong style={{ fontSize: 16, letterSpacing: '-.02em' }}>{TOPUP.recaps} extra recaps</strong>
              <span style={{ color: 'var(--muted)', fontWeight: 600, marginLeft: 10 }}>${TOPUP.price} · one-time</span>
              {usage.extra > 0 && (
                <span className="pill" style={{ background: 'var(--green-soft)', color: 'var(--green)', marginLeft: 10 }}>
                  {usage.extra} unspent
                </span>
              )}
            </div>
            <BillingButton topup>
              Get {TOPUP.recaps} more — ${TOPUP.price}
            </BillingButton>
          </div>
          <p className="desc" style={{ marginTop: 10 }}>
            Topping up two months in a row? The bigger plan is cheaper — switch below.
          </p>
        </section>
      )}

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon b" aria-hidden>📦</span>
          <div>
            <h3>Plans</h3>
            <p className="desc">Both plans are the full Lesson Studio — the difference is recaps per month.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {PLANS.filter(
            // Someone grandfathered on a bigger allowance is not shown the
            // smaller tiers — that is not an upgrade path, it is a downgrade
            // dressed as one.
            (p) => usage.trial || !current || p.recaps > current.recaps || p.id === current.id,
          ).map((p) => {
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
                  <BillingButton planId={p.id} className="btn btn-ghost btn-sm">
                    {usage.trial ? `Choose ${p.name}` : `Switch to ${p.name}`}
                  </BillingButton>
                )}
              </div>
            )
          })}
        </div>

        {hasBilling && (
          <div style={{ marginTop: 16 }}>
            <BillingButton portal className="btn btn-ghost btn-sm">
              Manage billing
            </BillingButton>
            <p className="desc" style={{ marginTop: 8 }}>
              Card, invoices and cancelling all live on Stripe.
              {current && !PLANS.some((p) => p.id === current.id) && (
                <> Your {current.name} plan is no longer sold — it stays at ${current.price}/month for as long as you keep it.</>
              )}
            </p>
          </div>
        )}
      </section>
    </>
  )
}
