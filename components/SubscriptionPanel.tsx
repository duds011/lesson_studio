import type { RecapUsage } from '@/lib/recap-quota'
import { PACKS, TRIAL_RECAPS, perRecap } from '@/lib/plans'
import BillingButton from '@/components/BillingButton'

/**
 * Settings → Lessons: how many write-ups are left, and how to buy more.
 *
 * This was "Your plan", and it had a lot to say — which tier you were on, how
 * much of the month was gone, which tiers were bigger, and a link to Stripe's
 * portal for cancelling. All of that existed because the thing being sold was
 * a subscription.
 *
 * There is no plan now, so there is no plan to explain. One balance, three
 * packs, and no portal link: nothing recurs, so there is nothing to cancel and
 * no card that has to stay valid.
 */
export default function SubscriptionPanel({ usage }: { usage: RecapUsage }) {
  const empty = usage.left === 0

  return (
    <>
      <section className="k-sec" style={{ marginBottom: 18 }}>
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>📝</span>
          <div>
            <h3>Write-ups left</h3>
            <p className="desc">
              One is spent each time a lesson is written up. They do not expire and nothing renews.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <strong
            style={{
              fontSize: 44,
              letterSpacing: '-.04em',
              lineHeight: 1,
              color: empty ? 'var(--red)' : 'var(--ink)',
            }}
          >
            {usage.left}
          </strong>
          <span style={{ color: 'var(--muted)', fontWeight: 650 }}>
            {usage.trial
              ? `of your ${TRIAL_RECAPS} free write-ups${usage.used ? ` · ${usage.used} used` : ''}`
              : `${usage.used} built so far`}
          </span>
        </div>

        {empty && (
          <p className="desc" style={{ marginTop: 10, maxWidth: '58ch' }}>
            {usage.trial
              ? 'That is the free ones used. A pack below keeps your lessons being written up — there is no subscription and no renewal date.'
              : 'Your balance is empty. A pack below tops it back up, and whatever you do not use stays there.'}
          </p>
        )}
      </section>

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>🎟️</span>
          <div>
            <h3>Add write-ups</h3>
            <p className="desc">
              One payment, no renewal. A bigger pack costs a little less each — but the small one is
              not a penalty, and whatever you buy is yours until you use it.
            </p>
          </div>
        </div>

        <div className="k-packs">
          {PACKS.map((pack) => (
            <div key={pack.id} className="k-pack">
              <p className="k-pack-tag">{pack.tag}</p>
              <p className="k-pack-n">{pack.recaps}</p>
              <p className="k-pack-unit">lessons written up</p>
              <p className="k-pack-price">
                ${pack.price}
                <span> · {perRecap(pack)} each</span>
              </p>
              <p className="k-pack-blurb">{pack.blurb}</p>
              <BillingButton packId={pack.id} className="k-btn-block">
                Buy {pack.recaps}
              </BillingButton>
            </div>
          ))}
        </div>

        <p className="desc" style={{ marginTop: 14, maxWidth: '62ch' }}>
          Paid once, by card, through Stripe. No card is kept here and nothing charges you again.
        </p>
      </section>
    </>
  )
}
