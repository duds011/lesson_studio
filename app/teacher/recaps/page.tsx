import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { getDict, fill } from '@/lib/i18n'
import { teacherLocale } from '@/lib/i18n/server'
import { TRIAL_RECAPS, getRecapUsage } from '@/lib/recap-quota'
import CountUp from '@/components/portal/CountUp'
import RecapPacks from '@/components/RecapPacks'

export const dynamic = 'force-dynamic'

/**
 * Write-ups: the balance, and the packs that top it up.
 *
 * This lived in Settings → Lessons, which is the wrong shelf twice over.
 * Settings is where you go to change how something behaves; buying is not a
 * setting, and a teacher who has run out is not going to look for the shop
 * under a gear icon. It was also three clicks from anywhere — Settings, the
 * right tab, then scroll — for the one action the business depends on.
 *
 * So it is a page of its own with a permanent way in: "Buy more write-ups" in
 * the sidebar, and the balance tile on the overview, which now lands here.
 */
export default async function RecapsPage() {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/teacher/recaps')
  const t = getDict(await teacherLocale(supabase, user.id))
  const usage = await getRecapUsage(user.id)
  const empty = usage.left === 0

  return (
    // No wrapper class: /teacher pages already render inside the layout's
    // .wrap, and a second max-width would narrow this one for no reason.
    <div style={{ display: 'grid', gap: 18 }}>
      <header className="k-thead slim">
        <div className="k-thead-title">
          <span className="k-phead-eyebrow">{t.billing.eyebrow}</span>
          <h1>{t.billing.title}</h1>
        </div>
        <div className="k-hero-art" style={{ right: -20, opacity: .4 }} aria-hidden>
          <span className="k-orb" style={{ width: 64, height: 64, right: 14, top: -6 }} />
          <span className="k-ring" style={{ width: 36, height: 36, right: 80, top: 44 }} />
        </div>
      </header>

      <section className="k-sec">
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
            <CountUp value={usage.left} />
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

        <RecapPacks />

        {/* The question every prepaid pack raises, answered before it is
            asked — and the reason these are not subscriptions. Same pair of
            sentences the website ends its pricing section with. */}
        <div className="k-never">
          <strong>{t.billing.neverTitle}</strong>
          <span>{t.billing.neverBody}</span>
        </div>

        <p className="desc" style={{ marginTop: 14, maxWidth: '62ch' }}>
          {t.billing.paidOnce}
        </p>
      </section>
    </div>
  )
}
