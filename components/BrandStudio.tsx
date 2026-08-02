'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import {
  ACCENT_PRESETS, DEFAULT_BRAND, BLOCK_LABELS, brandVars, backgroundClass,
  type Brand, type HeroStyle, type BackgroundStyle, type ShapeStyle, type PropStyle,
  type BlockId, type Layout,
} from '@/lib/brand'

const HEX = /^#[0-9a-fA-F]{6}$/

const HERO_STYLES: { value: HeroStyle; label: string; hint: string }[] = [
  { value: 'forest', label: 'Solid', hint: 'Filled accent panel' },
  { value: 'accent', label: 'Gradient', hint: 'Accent fading to light' },
  { value: 'light', label: 'Light', hint: 'Soft tint, dark text' },
]

const BACKGROUNDS: { value: BackgroundStyle; label: string }[] = [
  { value: 'plain', label: 'Plain' }, { value: 'dots', label: 'Dots' }, { value: 'grid', label: 'Grid' },
  { value: 'blobs', label: 'Blobs' }, { value: 'rings', label: 'Rings' }, { value: 'waves', label: 'Waves' },
  { value: 'wash', label: 'Wash' },
]

const SHAPES: { value: ShapeStyle; label: string; radius: number }[] = [
  { value: 'rounded', label: 'Rounded', radius: 16 }, { value: 'soft', label: 'Soft', radius: 10 },
  { value: 'sharp', label: 'Sharp', radius: 3 }, { value: 'pill', label: 'Pill', radius: 23 },
]

const PROPS: { value: PropStyle; label: string }[] = [
  { value: 'orbs', label: 'Orbs' }, { value: 'geometric', label: 'Geometric' },
  { value: 'minimal', label: 'Minimal' }, { value: 'none', label: 'None' },
]

const TOGGLES: { key: keyof Brand; label: string; hint: string }[] = [
  { key: 'showMilestone', label: 'Milestone tracker', hint: 'Progress toward their next level' },
  { key: 'showProgress', label: 'Progress charts', hint: 'Score, talk-time and vocabulary trends' },
  { key: 'showVocab', label: 'Vocabulary breakdown', hint: 'Words learned by level' },
  { key: 'showTests', label: 'Practice tests', hint: 'Tests you publish to them' },
  { key: 'showSpeaking', label: 'Speaking habits', hint: 'Pace and thinking time' },
]

type Col = 'main' | 'rail'
type Grab = { col: Col; index: number } | null

export default function BrandStudio({ initial, teacherName }: { initial: Brand; teacherName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [brand, setBrand] = useState<Brand>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  // Drag state for rearranging blocks directly on the preview.
  const [grab, setGrab] = useState<Grab>(null)
  const [over, setOver] = useState<{ col: Col; index: number } | null>(null)

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

  /** Move a block to a new slot, across columns if needed. */
  const move = (from: { col: Col; index: number }, to: { col: Col; index: number }) => {
    const next: Layout = { main: [...brand.layout.main], rail: [...brand.layout.rail] }
    const [block] = next[from.col].splice(from.index, 1)
    if (!block) return
    // Removing an earlier item in the same column shifts the target left.
    const target = from.col === to.col && from.index < to.index ? to.index - 1 : to.index
    next[to.col].splice(Math.max(0, Math.min(next[to.col].length, target)), 0, block)
    set('layout', next)
  }

  const hidden = new Set<BlockId>()
  if (!brand.showMilestone) hidden.add('milestone')
  if (!brand.showProgress) hidden.add('progress')
  if (!brand.showVocab) hidden.add('vocab')
  if (!brand.showTests) hidden.add('tests')
  if (!brand.showSpeaking) hidden.add('speaking')

  const vars = brandVars(brand)
  const heroBg =
    brand.heroStyle === 'accent' ? `linear-gradient(135deg, ${brand.accent}, ${brand.accent}dd 55%, #ffffff22)`
    : brand.heroStyle === 'light' ? `${brand.accent}1a`
    : brand.accent
  const heroInk = brand.heroStyle === 'light' ? 'var(--ink)' : '#fff'
  const heroSub = brand.heroStyle === 'light' ? 'var(--muted)' : 'rgba(255,255,255,.72)'

  /** The miniature of each block, as it appears in the student view. */
  const preview = (id: BlockId): React.ReactNode => {
    switch (id) {
      case 'hero':
        return (
          <div className="k-preview-hero" style={{ background: heroBg, color: heroInk }}>
            <strong style={{ whiteSpace: 'pre-line' }}>{brand.headline || DEFAULT_BRAND.headline}</strong>
            <p style={{ color: heroSub }}>{brand.welcome || DEFAULT_BRAND.welcome}</p>
            <span className="k-preview-btn" style={{ background: brand.heroStyle === 'light' ? brand.accent : '#fff', color: brand.heroStyle === 'light' ? '#fff' : brand.accent }}>
              Book a lesson
            </span>
            {brand.props !== 'none' && (
              <div className="k-preview-props" aria-hidden>
                {brand.props === 'orbs' && <><span className="k-orb" style={{ width: 40, height: 40, right: 8, top: 6 }} /><span className="k-tube" style={{ width: 30, height: 30, right: 44, top: 38, borderWidth: 7 }} /></>}
                {brand.props === 'geometric' && <><span className="k-crystal" style={{ width: 28, height: 34, right: 12, top: 8 }} /><span className="k-ring" style={{ width: 26, height: 26, right: 46, top: 34, borderWidth: 6 }} /></>}
                {brand.props === 'minimal' && <span className="k-ring" style={{ width: 34, height: 34, right: 12, top: 14, borderWidth: 6 }} />}
              </div>
            )}
          </div>
        )
      case 'stats':
        return (
          <div className="k-preview-stats">
            <div style={{ background: 'var(--c-yellow)', color: 'var(--c-yellow-ink)' }}><span>Lessons</span><b>12</b></div>
            <div style={{ background: 'var(--c-blue)' }}><span>Avg score</span><b>7.4</b></div>
            <div style={{ background: 'var(--c-purple)' }}><span>Speaking</span><b>41%</b></div>
          </div>
        )
      case 'lessons':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong>Your lessons</strong><span>12</span></div>
            <div className="k-preview-lessons">
              <div><i style={{ background: brand.accent }} />Contrasting ideas<span>7.2</span></div>
              <div><i style={{ background: `${brand.accent}66` }} />Giving reasons<span>6.8</span></div>
            </div>
          </div>
        )
      case 'progress':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong>Your progress</strong></div>
            <div className="k-preview-spark">
              <i style={{ background: brand.accent }} />
              <i style={{ background: brand.accent, height: '55%' }} />
              <i style={{ background: brand.accent, height: '78%' }} />
              <i style={{ background: brand.accent, height: '92%' }} />
            </div>
          </div>
        )
      case 'vocab':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Vocabulary</strong><span>45 words</span></div></div>
      case 'calendar':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong>August</strong><span>22</span></div>
            <div className="k-preview-cal" aria-hidden>
              {Array.from({ length: 14 }).map((_, i) => (
                <i key={i} style={i === 4 ? { background: brand.accent } : undefined} />
              ))}
            </div>
          </div>
        )
      case 'milestone':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong>Next milestone</strong><span>60%</span></div>
            <div className="k-hw-track" style={{ marginTop: 8 }}><div className="k-hw-fill" style={{ width: '60%', background: brand.accent }} /></div>
          </div>
        )
      case 'scores':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong>Recent scores</strong><span>Last 2</span></div>
            <div className="k-hw-track" style={{ marginTop: 8 }}><div className="k-hw-fill" style={{ width: '72%', background: brand.accent }} /></div>
            <div className="k-hw-track" style={{ marginTop: 5 }}><div className="k-hw-fill" style={{ width: '62%', background: `${brand.accent}88` }} /></div>
          </div>
        )
      case 'tests':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Practice tests</strong><span>2</span></div></div>
      case 'speaking':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Speaking habits</strong><span>54 wpm</span></div></div>
    }
  }

  /** A preview block wrapped so it can be picked up and dropped with the mouse. */
  const block = (id: BlockId, col: Col, index: number) => (
    <div
      key={id}
      draggable
      className={[
        'k-pblock',
        hidden.has(id) ? 'off' : '',
        grab?.col === col && grab.index === index ? 'dragging' : '',
        over?.col === col && over.index === index && !(grab?.col === col && grab.index === index) ? 'over' : '',
      ].join(' ')}
      title={`Drag to move ${BLOCK_LABELS[id]}`}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setGrab({ col, index }) }}
      onDragEnd={() => { setGrab(null); setOver(null) }}
      onDragOver={(e) => { e.preventDefault(); setOver({ col, index }) }}
      onDrop={(e) => {
        e.preventDefault(); e.stopPropagation()
        if (grab) move(grab, { col, index })
        setGrab(null); setOver(null)
      }}
    >
      <span className="k-pblock-tag">{BLOCK_LABELS[id]}{hidden.has(id) ? ' · hidden' : ''}</span>
      {preview(id)}
    </div>
  )

  /** A column, droppable at its end so a block can be appended. */
  const column = (col: Col) => (
    <div
      className={`k-pcol ${over?.col === col && over.index >= brand.layout[col].length ? 'over-end' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver({ col, index: brand.layout[col].length }) }}
      onDrop={(e) => {
        e.preventDefault()
        if (grab) move(grab, { col, index: brand.layout[col].length })
        setGrab(null); setOver(null)
      }}
    >
      {brand.layout[col].map((id, i) => block(id, col, i))}
      {brand.layout[col].length === 0 && <div className="k-pcol-empty">Drop here</div>}
    </div>
  )

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
            <textarea className="k-input" rows={2} value={brand.headline} onChange={(e) => set('headline', e.target.value)} maxLength={90} placeholder={DEFAULT_BRAND.headline} />
          </label>

          <label className="k-field">
            <span>Hero subtext</span>
            <textarea className="k-input" rows={3} value={brand.welcome} onChange={(e) => set('welcome', e.target.value)} maxLength={200} placeholder={DEFAULT_BRAND.welcome} />
          </label>
        </section>

        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon b" aria-hidden>🖼️</span>
            <div>
              <h3>Background &amp; shape</h3>
              <p className="desc">The texture behind the portal and how round everything is.</p>
            </div>
          </div>

          <span className="k-field-label" style={{ marginTop: 0 }}>Background</span>
          <div className="k-preset-grid">
            {BACKGROUNDS.map((b) => (
              <button key={b.value} type="button" className={`k-preset ${brand.background === b.value ? 'sel' : ''}`} onClick={() => set('background', b.value)}>
                <span className={`k-bg-chip k-bg-${b.value}`} style={{ display: 'block' }} aria-hidden />
                <span>{b.label}</span>
              </button>
            ))}
          </div>

          <span className="k-field-label">Corners</span>
          <div className="k-preset-grid">
            {SHAPES.map((sh) => (
              <button key={sh.value} type="button" className={`k-preset ${brand.shape === sh.value ? 'sel' : ''}`} onClick={() => set('shape', sh.value)}>
                <span className="k-bg-chip k-shape-chip" style={{ borderRadius: sh.radius }} aria-hidden />
                <span>{sh.label}</span>
              </button>
            ))}
          </div>

          <span className="k-field-label">Hero decoration</span>
          <div className="k-choices">
            {PROPS.map((pr) => (
              <button key={pr.value} type="button" className={`k-choice ${brand.props === pr.value ? 'sel' : ''}`} onClick={() => set('props', pr.value)}>
                <span className="k-choice-tick" aria-hidden>✓</span>
                <span>{pr.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon p" aria-hidden>🧩</span>
            <div>
              <h3>Sections</h3>
              <p className="desc">Hide anything that doesn&rsquo;t fit how you teach. Hidden blocks keep their place in the layout.</p>
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

      {/* ── live, directly-editable preview ── */}
      <div className="k-studio-preview">
        <div className="k-preview-bar">
          <span className="k-preview-label">Student view · drag to rearrange</span>
          <div className="k-seg" style={{ margin: 0, width: 168 }}>
            <button className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>Desktop</button>
            <button className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>Phone</button>
          </div>
        </div>

        <div className={`k-preview-frame ${device} ${backgroundClass(brand)}`} style={vars}>
          <div className="k-preview-top">
            <span className="k-preview-mark" style={{ background: `${brand.accent}22`, color: brand.accent }}>{brand.logoText || '📚'}</span>
            <div>
              <div className="k-preview-hello">Welcome back,</div>
              <div className="k-preview-name">Derek</div>
            </div>
          </div>

          <div className={`k-preview-grid ${device}`}>
            {column('main')}
            {column('rail')}
          </div>
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          Grab any block and drop it where you want — including across the two columns.
          This is {teacherName ? `${teacherName}'s` : 'your'} student dashboard; save to publish it.
        </p>
      </div>
    </div>
  )
}
