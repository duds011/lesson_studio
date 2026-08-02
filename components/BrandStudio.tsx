'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import { ACCENT_PRESETS, DEFAULT_BRAND, brandVars, type Brand, type HeroStyle } from '@/lib/brand'

const HEX = /^#[0-9a-fA-F]{6}$/

const HERO_STYLES: { value: HeroStyle; label: string; hint: string }[] = [
  { value: 'forest', label: 'Solid', hint: 'Filled accent panel' },
  { value: 'accent', label: 'Gradient', hint: 'Accent fading to light' },
  { value: 'light', label: 'Light', hint: 'Soft tint, dark text' },
]

const TOGGLES: { key: keyof Brand; label: string; hint: string }[] = [
  { key: 'showMilestone', label: 'Milestone tracker', hint: 'Progress toward their next level' },
  { key: 'showProgress', label: 'Progress charts', hint: 'Score, talk-time and vocabulary trends' },
  { key: 'showVocab', label: 'Vocabulary breakdown', hint: 'Words learned split by JLPT level' },
  { key: 'showTests', label: 'Practice tests', hint: 'Tests you publish to them' },
  { key: 'showSpeaking', label: 'Speaking habits', hint: 'Pace and thinking time' },
]

export default function BrandStudio({ initial, teacherName }: { initial: Brand; teacherName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [brand, setBrand] = useState<Brand>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  const set = <K extends keyof Brand>(key: K, value: Brand[K]) => {
    setBrand((b) => ({ ...b, [key]: value }))
    setSaved(false)
  }

  const save = () =>
    startTransition(async () => {
      setError('')
      const res = await saveBrand(brand)
      if (!res.success) { setError(res.error || 'Could not save'); return }
      setSaved(true)
      router.refresh()
    })

  const reset = () => { setBrand(DEFAULT_BRAND); setSaved(false) }

  const vars = brandVars(brand)
  const heroBg =
    brand.heroStyle === 'accent' ? `linear-gradient(135deg, ${brand.accent}, ${brand.accent}dd 55%, #ffffff22)`
    : brand.heroStyle === 'light' ? `${brand.accent}1a`
    : brand.accent
  const heroInk = brand.heroStyle === 'light' ? 'var(--ink)' : '#fff'
  const heroSub = brand.heroStyle === 'light' ? 'var(--muted)' : 'rgba(255,255,255,.72)'

  return (
    <div className="k-studio">
      {/* ── controls ── */}
      <div className="k-studio-controls">
        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon" aria-hidden>🎨</span>
            <div>
              <h3>Colour</h3>
              <p className="desc">Used for buttons, active states and progress bars.</p>
            </div>
          </div>

          <div className="k-swatches">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                title={p.name}
                aria-label={p.name}
                className={`k-swatch ${brand.accent.toLowerCase() === p.value.toLowerCase() ? 'sel' : ''}`}
                style={{ background: p.value }}
                onClick={() => set('accent', p.value)}
              />
            ))}
          </div>

          <label className="k-field" style={{ marginTop: 14 }}>
            <span>Custom hex</span>
            <input
              value={brand.accent}
              onChange={(e) => { const v = e.target.value; setSaved(false); setBrand((b) => ({ ...b, accent: HEX.test(v) ? v : v.slice(0, 7) })) }}
              placeholder="#234f3c"
              maxLength={7}
              spellCheck={false}
            />
          </label>

          <span className="k-field-label">Hero style</span>
          <div className="k-choices">
            {HERO_STYLES.map((h) => (
              <button key={h.value} type="button" className={`k-choice ${brand.heroStyle === h.value ? 'sel' : ''}`} onClick={() => set('heroStyle', h.value)}>
                <span className="k-choice-tick" aria-hidden>✓</span>
                <span>{h.label}<small>{h.hint}</small></span>
              </button>
            ))}
          </div>
        </section>

        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon y" aria-hidden>✍️</span>
            <div>
              <h3>Words</h3>
              <p className="desc">What your students read when they sign in.</p>
            </div>
          </div>

          <label className="k-field">
            <span>Portal name</span>
            <input value={brand.portalName} onChange={(e) => set('portalName', e.target.value)} maxLength={40} placeholder="Lesson Studio" />
          </label>

          <label className="k-field">
            <span>Mark <small style={{ fontWeight: 500 }}>(emoji or initials)</small></span>
            <input value={brand.logoText} onChange={(e) => set('logoText', e.target.value)} maxLength={4} placeholder="📚" />
          </label>

          <label className="k-field">
            <span>Hero headline</span>
            <textarea
              className="k-input"
              rows={2}
              value={brand.headline}
              onChange={(e) => set('headline', e.target.value)}
              maxLength={90}
              placeholder={DEFAULT_BRAND.headline}
            />
          </label>

          <label className="k-field">
            <span>Hero subtext</span>
            <textarea
              className="k-input"
              rows={3}
              value={brand.welcome}
              onChange={(e) => set('welcome', e.target.value)}
              maxLength={200}
              placeholder={DEFAULT_BRAND.welcome}
            />
          </label>
        </section>

        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon p" aria-hidden>🧩</span>
            <div>
              <h3>Sections</h3>
              <p className="desc">Hide anything that doesn&rsquo;t fit how you teach.</p>
            </div>
          </div>

          <div className="k-toggles">
            {TOGGLES.map((t) => (
              <div className="k-toggle-row" key={t.key}>
                <div>
                  <div className="k-hw-title">{t.label}</div>
                  <div className="k-hw-due">{t.hint}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(brand[t.key])}
                  aria-label={t.label}
                  className={`k-switch ${brand[t.key] ? 'on' : ''}`}
                  onClick={() => set(t.key, !brand[t.key] as never)}
                />
              </div>
            ))}
          </div>
        </section>

        {error && <p className="k-error">{error}</p>}

        <div className="k-studio-actions">
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={pending}>Reset to default</button>
          {saved && <span className="k-saved">✓ Saved — your students see this now</span>}
          <button type="button" className="k-btn-block" style={{ width: 'auto', marginLeft: 'auto' }} onClick={save} disabled={pending}>
            {pending ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>

      {/* ── live preview ── */}
      <div className="k-studio-preview">
        <div className="k-preview-bar">
          <span className="k-preview-label">Student view</span>
          <div className="k-seg" style={{ margin: 0, width: 168 }}>
            <button className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>Desktop</button>
            <button className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>Phone</button>
          </div>
        </div>

        <div className={`k-preview-frame ${device}`} style={vars}>
          <div className="k-preview-top">
            <span className="k-preview-mark" style={{ background: `${brand.accent}22`, color: brand.accent }}>{brand.logoText || '📚'}</span>
            <div>
              <div className="k-preview-hello">Welcome back,</div>
              <div className="k-preview-name">Derek</div>
            </div>
          </div>

          <div className="k-preview-hero" style={{ background: heroBg, color: heroInk }}>
            <strong style={{ whiteSpace: 'pre-line' }}>{brand.headline || DEFAULT_BRAND.headline}</strong>
            <p style={{ color: heroSub }}>{brand.welcome || DEFAULT_BRAND.welcome}</p>
            <span className="k-preview-btn" style={{ background: brand.heroStyle === 'light' ? brand.accent : '#fff', color: brand.heroStyle === 'light' ? '#fff' : brand.accent }}>
              Book a lesson
            </span>
          </div>

          <div className="k-preview-stats">
            <div style={{ background: 'var(--c-yellow)', color: 'var(--c-yellow-ink)' }}><span>Lessons</span><b>12</b></div>
            <div style={{ background: 'var(--c-blue)' }}><span>Avg score</span><b>7.4</b></div>
            <div style={{ background: 'var(--c-purple)' }}><span>Speaking</span><b>41%</b></div>
          </div>

          {brand.showMilestone && (
            <div className="k-preview-card">
              <div className="k-preview-row"><strong>Next milestone</strong><span>60%</span></div>
              <div className="k-hw-track"><div className="k-hw-fill" style={{ width: '60%', background: brand.accent }} /></div>
            </div>
          )}

          <div className="k-preview-card">
            <div className="k-preview-row"><strong>Your lessons</strong><span>12</span></div>
            <div className="k-preview-lessons">
              <div><i style={{ background: brand.accent }} />Contrasting ideas<span>7.2</span></div>
              <div><i style={{ background: `${brand.accent}66` }} />Giving reasons<span>6.8</span></div>
            </div>
          </div>

          {brand.showProgress && <div className="k-preview-card"><div className="k-preview-row"><strong>Your progress</strong></div><div className="k-preview-spark"><i style={{ background: brand.accent }} /><i style={{ background: brand.accent, height: '55%' }} /><i style={{ background: brand.accent, height: '78%' }} /><i style={{ background: brand.accent, height: '92%' }} /></div></div>}
          {brand.showVocab && <div className="k-preview-card"><div className="k-preview-row"><strong>Vocabulary</strong><span>45 words</span></div></div>}
          {brand.showTests && <div className="k-preview-card"><div className="k-preview-row"><strong>Practice tests</strong><span>2</span></div></div>}
          {brand.showSpeaking && <div className="k-preview-card"><div className="k-preview-row"><strong>Speaking habits</strong><span>54 wpm</span></div></div>}
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          A live approximation of {teacherName ? `${teacherName}'s` : 'your'} student dashboard. Save to publish it — students see the change on their next load.
        </p>
      </div>
    </div>
  )
}
