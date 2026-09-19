'use client'

import { useEffect, useState } from 'react'
import { PACKS, MIN_SAVING_PCT } from '@/lib/plans'
import {
  PACK_CURRENCIES,
  DEFAULT_PACK_CURRENCY,
  detectPackCurrency,
  formatPackMoney,
  packSavingPct,
  type PackCurrency,
} from '@/lib/pack-currency'
import BillingButton from '@/components/BillingButton'
import { useT } from '@/components/I18nProvider'
import { fill } from '@/lib/i18n'

/**
 * The three packs, drawn the way kokulabs.net draws them.
 *
 * They used to be three small grey boxes in a settings tab: a tag, a number, a
 * price and a button. A teacher who had just decided on the website — where the
 * same three packs are coloured, ringed and carry their features — arrived at
 * the place they actually pay and found something plainer than the advert. The
 * two surfaces are one decision seen twice, so they should look like it.
 *
 * What is copied from the site, and why each part earns its place:
 *  - a colour per pack (green, blue, purple), so the three read apart at a
 *    glance rather than as one repeated card;
 *  - "Never expires" under the price, because that is the only real objection
 *    to paying up front and it has to be on the card, not in a footnote read
 *    afterwards;
 *  - a saving instead of a price per write-up. A unit price invites arithmetic
 *    against somebody else's unit price; a saving is a fact about this offer
 *    alone. Below MIN_SAVING_PCT nothing is shown at all;
 *  - the ring on the recommended card. `featured` means "wears the ring", not
 *    "is filled" — a solid slab made that card a different kind of object from
 *    its neighbours instead of the same object recommended.
 *
 * What is NOT copied: the feature list. On the website it argues for the
 * product to somebody who has not bought it. Here the reader is already inside
 * the product, so it would be selling them what they are looking at.
 */

/** Indexed to PACKS in lib/plans.ts. Colour only — the words are in the dict. */
const LOOK = [
  { accent: '#149467', soft: '#e6f4ec', featured: false },
  { accent: '#0a61c9', soft: '#e7f0fc', featured: false },
  { accent: '#7a3fd1', soft: '#f1e9fc', featured: true },
]

/** A lemniscate — "no end" without spending a word on it. */
function NoExpiry() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
    </svg>
  )
}

export default function RecapPacks() {
  const t = useT()

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
  const sizes = PACKS.map((p) => p.recaps)

  return (
    <div className="k-packs">
      {PACKS.map((pack, i) => {
        const look = LOOK[i] ?? LOOK[0]
        const save = packSavingPct(code, i, sizes, MIN_SAVING_PCT)
        return (
          <div
            key={pack.id}
            className={`k-pack${look.featured ? ' k-pack-ring' : ''}`}
            style={{ ['--pack' as any]: look.accent, ['--pack-soft' as any]: look.soft }}
          >
            <div className="k-pack-head">
              <h3>{t.billing.packNames[i]}</h3>
              <span className="k-pack-tag">{t.billing.packTags[i]}</span>
            </div>

            <p className="k-pack-price">
              {formatPackMoney(prices[i], code)}
              <span>{t.billing.once}</span>
            </p>

            <p className="k-pack-never"><NoExpiry />{t.billing.neverExpires}</p>

            <div className="k-pack-strip">
              <span>{fill(t.billing.nWriteUps, { n: pack.recaps })}</span>
              {save !== null && <span className="k-pack-save">{fill(t.billing.save, { pct: save })}</span>}
            </div>

            <BillingButton packId={pack.id} className="k-pack-buy">
              {fill(t.billing.buy, { n: pack.recaps })}
            </BillingButton>
          </div>
        )
      })}
    </div>
  )
}
