'use client'

import { useEffect, useState } from 'react'
import type { RecapUsage } from '@/lib/recap-quota'
import { PACKS, TRIAL_RECAPS, savingPct } from '@/lib/plans'
import {
  PACK_CURRENCIES,
  DEFAULT_PACK_CURRENCY,
  detectPackCurrency,
  formatPackMoney,
  type PackCurrency,
} from '@/lib/pack-currency'
import BillingButton from '@/components/BillingButton'
import { useT } from '@/components/I18nProvider'
import { fill } from '@/lib/i18n'

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
  const t = useT()
  const empty = usage.left === 0

  /**
   * Quote the same currency the website did, and the same one checkout will
   * charge — all three read the browser's time zone.
   *
   * Dollars render first, on the server and on the first client pass, so the
   * markup React builds matches the markup it hydrates. Detecting during
   * render instead throws the subtree away and the prices flash.
   */
  const [code, setCode] = useState<PackCurrency>(DEFAULT_PACK_CURRENCY)
  useEffect(() => setCode(detectPackCurrency()), [])
  const prices = PACK_CURRENCIES[code].packs

  return (
    <>
      <section className="k-sec" style={{ marginBottom: 18 }}>
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>📝</span>
          <div>
            <h3>{t.billing.leftTitle}</h3>
            <p className="desc">{t.billing.leftDesc}</p>
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
              ? fill(usage.used ? t.billing.ofFreeUsed : t.billing.ofFree, {
                  total: TRIAL_RECAPS,
                  used: usage.used,
                })
              : fill(t.billing.builtSoFar, { used: usage.used })}
          </span>
        </div>

        {empty && (
          <p className="desc" style={{ marginTop: 10, maxWidth: '58ch' }}>
            {usage.trial ? t.billing.emptyTrial : t.billing.emptyPaid}
          </p>
        )}
      </section>

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>🎟️</span>
          <div>
            <h3>{t.billing.addTitle}</h3>
            <p className="desc">{t.billing.addDesc}</p>
          </div>
        </div>

        <div className="k-packs">
          {PACKS.map((pack, i) => (
            <div key={pack.id} className="k-pack">
              <p className="k-pack-tag">{t.billing.packTags[i]}</p>
              <p className="k-pack-n">{pack.recaps}</p>
              <p className="k-pack-unit">{t.billing.lessonsWrittenUp}</p>
              <p className="k-pack-price">{formatPackMoney(prices[i], code)}</p>
              {/* Never a price per write-up. A unit price invites the teacher
                  to compare against somebody else's unit price; a saving is a
                  fact about this offer alone — so it is the one number here
                  loud enough to read on its own. */}
              {savingPct(pack) !== null && (
                <p className="k-pack-save">{fill(t.billing.save, { pct: savingPct(pack)! })}</p>
              )}
              <p className="k-pack-never">{t.billing.neverExpires}</p>
              <BillingButton packId={pack.id} className="k-btn-block">
                {fill(t.billing.buy, { n: pack.recaps })}
              </BillingButton>
            </div>
          ))}
        </div>

        <p className="desc" style={{ marginTop: 14, maxWidth: '62ch' }}>
          {t.billing.paidOnce}
        </p>
      </section>
    </>
  )
}
