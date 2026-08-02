'use client'

import { Fragment, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import {
  ACCENT_PRESETS, DEFAULT_BRAND, BLOCK_LABELS, brandVars, backgroundClass,
  MIN_BLOCK_H, MAX_BLOCK_H,
  type Brand, type HeroStyle, type BackgroundStyle, type ShapeStyle, type PropStyle,
  type BlockId, type Layout,
} from '@/lib/brand'
import { MilestoneGauge, MiniTrend, ScoreTrendChart, VocabLevelChart } from './portal/BrandCharts'

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

/** Stand-in data so the preview charts look like a real student's. */
const SAMPLE_SCORES = [
  { lesson: 8, score: 6.4 }, { lesson: 9, score: 7.1 }, { lesson: 10, score: 6.9 },
  { lesson: 11, score: 7.8 }, { lesson: 12, score: 8.3 },
]
const SAMPLE_TREND = SAMPLE_SCORES.map((p) => ({ x: p.lesson, y: p.score }))
const SAMPLE_VOCAB = { N5: 18, N4: 13, N3: 9, N2: 5 }

/**
 * Card padding + heading above a preview chart. A block resized to H spends
 * H − CHROME on the plot so the block itself lands on the height dragged.
 */
const CHART_CHROME = 62

type Col = 'main' | 'rail'
type Grab = { col: Col; index: number } | null
/** Where a dragged block would be inserted — an index *between* blocks. */
type Slot = { col: Col; index: number } | null

const LESSON_TABS = ['Progress', 'Lesson', 'Practice', 'Vocabulary'] as const
type LessonTab = (typeof LESSON_TABS)[number]

export default function BrandStudio({ initial, teacherName }: { initial: Brand; teacherName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [brand, setBrand] = useState<Brand>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard')
  const [lessonTab, setLessonTab] = useState<LessonTab>('Progress')

  // Drag state for rearranging blocks directly on the preview.
  const [grab, setGrab] = useState<Grab>(null)
  const [over, setOver] = useState<Slot>(null)
  // Bottom-edge resize.
  const [resizing, setResizing] = useState<BlockId | null>(null)
  const blockEls = useRef<Partial<Record<BlockId, HTMLDivElement | null>>>({})

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

  /**
   * Which insertion slot the pointer is asking for: above the block it is over,
   * or below it once past the midpoint.
   */
  const slotFor = (e: React.DragEvent, col: Col, index: number): { col: Col; index: number } => {
    const r = e.currentTarget.getBoundingClientRect()
    return { col, index: e.clientY > r.top + r.height / 2 ? index + 1 : index }
  }

  /** A slot only parts open if dropping there would actually move the block. */
  const slotOpen = (col: Col, index: number) => {
    if (!grab || !over) return false
    if (over.col !== col || over.index !== index) return false
    if (grab.col === col && (grab.index === index || grab.index + 1 === index)) return false
    return true
  }

  // ── vertical resize ──────────────────────────────────────────────────────
  const clampH = (n: number) => Math.max(MIN_BLOCK_H, Math.min(MAX_BLOCK_H, Math.round(n)))

  const startResize = (id: BlockId, e: React.PointerEvent) => {
    // Stops the browser starting an HTML5 drag from inside the draggable block.
    e.preventDefault()
    e.stopPropagation()
    const el = blockEls.current[id]
    if (!el) return
    const startY = e.clientY
    const startH = brand.heights[id] ?? el.getBoundingClientRect().height
    setResizing(id)
    setSaved(false)

    const onMove = (ev: PointerEvent) => {
      const h = clampH(startH + (ev.clientY - startY))
      setBrand((b) => (b.heights[id] === h ? b : { ...b, heights: { ...b.heights, [id]: h } }))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setResizing(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  /** Double-clicking the handle hands the block back to its content height. */
  const clearHeight = (id: BlockId) => {
    setBrand((b) => {
      if (b.heights[id] == null) return b
      const heights = { ...b.heights }
      delete heights[id]
      return { ...b, heights }
    })
    setSaved(false)
  }

  /** Height left for a chart inside a block the teacher has resized. */
  const chartH = (id: BlockId, fallback: number) => {
    const h = brand.heights[id]
    return h ? Math.max(52, h - CHART_CHROME) : fallback
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
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong>Your progress</strong><span>Score</span></div>
            <MiniTrend points={SAMPLE_TREND} color={brand.accent} height={chartH('progress', 62)} />
          </div>
        )
      case 'vocab':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong>Vocabulary</strong><span>45 words</span></div>
            <VocabLevelChart distribution={SAMPLE_VOCAB} height={chartH('vocab', 72)} compact />
          </div>
        )
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
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong>Next milestone</strong><span>Level 3</span></div>
            <MilestoneGauge pct={60} color={brand.accent} height={chartH('milestone', 92)} compact />
          </div>
        )
      case 'scores':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong>Recent scores</strong><span>Last 5</span></div>
            <ScoreTrendChart points={SAMPLE_SCORES} color={brand.accent} height={chartH('scores', 74)} compact />
          </div>
        )
      case 'tests':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Practice tests</strong><span>2</span></div></div>
      case 'speaking':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Speaking habits</strong><span>54 wpm</span></div></div>
    }
  }

  /** The gap that opens between two blocks to show where a drop would land. */
  const slot = (col: Col, index: number, edge: boolean) => (
    <div
      key={`slot-${col}-${index}`}
      aria-hidden
      className={['k-pslot', edge ? 'edge' : '', slotOpen(col, index) ? 'open' : ''].join(' ')}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver({ col, index }) }}
      onDrop={(e) => {
        e.preventDefault(); e.stopPropagation()
        if (grab) move(grab, { col, index })
        setGrab(null); setOver(null)
      }}
    >
      <span className="k-pslot-line" />
    </div>
  )

  /** A preview block wrapped so it can be picked up, dropped and resized. */
  const block = (id: BlockId, col: Col, index: number) => {
    const h = brand.heights[id]
    return (
      <div
        key={id}
        ref={(el) => { blockEls.current[id] = el }}
        draggable={resizing !== id}
        style={h ? { height: h } : undefined}
        className={[
          'k-pblock',
          hidden.has(id) ? 'off' : '',
          grab?.col === col && grab.index === index ? 'dragging' : '',
          resizing === id ? 'resizing' : '',
        ].join(' ')}
        title={`Drag to move ${BLOCK_LABELS[id]}`}
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setGrab({ col, index }) }}
        onDragEnd={() => { setGrab(null); setOver(null) }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver(slotFor(e, col, index)) }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation()
          if (grab) move(grab, slotFor(e, col, index))
          setGrab(null); setOver(null)
        }}
      >
        <span className="k-pblock-tag">
          {BLOCK_LABELS[id]}{hidden.has(id) ? ' · hidden' : ''}{h ? ` · ${h}px` : ''}
        </span>
        <div className="k-pblock-body">{preview(id)}</div>
        <span
          className="k-presize"
          role="separator"
          aria-orientation="horizontal"
          aria-label={`Resize ${BLOCK_LABELS[id]}`}
          title={`Drag to resize${h ? ` (${h}px) — double-click to fit content` : ''}`}
          draggable={false}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          onPointerDown={(e) => startResize(id, e)}
          onDoubleClick={(e) => { e.stopPropagation(); clearHeight(id) }}
        />
      </div>
    )
  }

  /** A column of blocks, with a drop slot above, between and below them. */
  const column = (col: Col) => {
    const ids = brand.layout[col]
    return (
      <div
        className="k-pcol"
        onDragOver={(e) => { e.preventDefault(); setOver({ col, index: ids.length }) }}
        onDrop={(e) => {
          e.preventDefault()
          if (grab) move(grab, { col, index: ids.length })
          setGrab(null); setOver(null)
        }}
      >
        {ids.map((id, i) => (
          <Fragment key={id}>
            {slot(col, i, i === 0)}
            {block(id, col, i)}
          </Fragment>
        ))}
        {slot(col, ids.length, true)}
        {ids.length === 0 && <div className="k-pcol-empty">Drop here</div>}
      </div>
    )
  }

  /** Miniature of the student's lesson recap page, themed by the same brand. */
  const lessonPreview = () => (
    <div className="k-lpview" key={device}>
      <span className="k-back">← Dashboard</span>

      <header className="k-phead">
        <div>
          <div className="k-phead-eyebrow">Lesson 12 · Recap</div>
          <h1>Contrasting ideas with けど</h1>
          <div className="k-pmeta">
            <span>12th lesson</span>
            <span>2 Aug</span>
            <span>Confident</span>
          </div>
        </div>
        <div className="k-pscore"><div><b>8.3</b><small>OUT OF 10</small></div></div>
        {brand.props !== 'none' && (
          <div className="k-hero-art" style={{ right: -20, opacity: .5 }} aria-hidden>
            <span className="k-orb" style={{ width: 60, height: 60, right: 8, top: 8 }} />
            <span className="k-tube" style={{ width: 46, height: 46, right: 56, top: 54, transform: 'rotate(40deg)' }} />
          </div>
        )}
      </header>

      <div className="tabs" role="tablist" aria-label="Lesson recap sections">
        {LESSON_TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={lessonTab === t} className={`tab ${lessonTab === t ? 'sel' : ''}`} onClick={() => setLessonTab(t)}>{t}</button>
        ))}
      </div>

      {lessonTab === 'Progress' && (
        <div role="tabpanel">
          <h3 className="dashboard-title">How this lesson went</h3>
          <div className="stat-cards">
            <div className="stat-card" style={{ ['--accent' as any]: 'var(--brand)' }}>
              <div className="stat-card-head"><span className="stat-icon">🗣️</span><span className="stat-card-label">Speaking balance</span></div>
              <div className="stat-card-value">58<span className="stat-unit">%</span> <span className="stat-sep">/</span> 42<span className="stat-unit">%</span></div>
              <div className="balance-bars" style={{ marginTop: 'auto' }}>
                <div className="balance-row"><span>Derek</span><div className="balance-track"><div className="balance-fill student" style={{ width: '58%' }} /></div><span>58%</span></div>
                <div className="balance-row"><span>{teacherName ? teacherName.split(' ')[0] : 'You'}</span><div className="balance-track"><div className="balance-fill" style={{ width: '42%' }} /></div><span>42%</span></div>
              </div>
            </div>

            <div className="stat-card" style={{ ['--accent' as any]: 'var(--green)' }}>
              <div className="stat-card-head"><span className="stat-icon">⭐</span><span className="stat-card-label">Score</span></div>
              <div className="stat-card-value" style={{ color: 'var(--green)' }}>8.3<span className="stat-unit">/10</span></div>
              <span className="stat-chip" style={{ marginTop: 'auto' }}>Confident</span>
            </div>

            <div className="stat-card" style={{ ['--accent' as any]: '#a36210' }}>
              <div className="stat-card-head"><span className="stat-icon">📚</span><span className="stat-card-label">Grammar density</span></div>
              <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>Rich</div>
              <p className="stat-card-note" style={{ marginTop: 'auto' }}>18 vocabulary items practiced</p>
            </div>
          </div>

          <div className="corrections-card">
            <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">⚡</span><span className="stat-card-label">Your speaking, measured</span></div>
            <div className="metric-grid">
              <div className="metric"><div className="mv">54</div><div className="mk">words / min</div><div className="mn">speaking pace</div></div>
              <div className="metric"><div className="mv">2.1s</div><div className="mk">thinking time</div><div className="mn">before you reply</div></div>
              <div className="metric"><div className="mv">41s</div><div className="mk">longest answer</div><div className="mn">best stretch</div></div>
              <div className="metric"><div className="mv">9</div><div className="mk">hesitation words</div><div className="mn">えーと, あの…</div></div>
            </div>
          </div>
        </div>
      )}

      {lessonTab === 'Lesson' && (
        <div className="tab-panel" role="tabpanel">
          <div className="lesson-block">
            <h3>What you practised</h3>
            <p>You used けど to contrast two ideas in the same sentence, and kept the polite form all the way through.</p>
          </div>
          <div className="lesson-block">
            <h3>Teacher&rsquo;s Note</h3>
            <p>Lovely progress on longer answers — next time try linking three clauses before pausing.</p>
          </div>
        </div>
      )}

      {lessonTab === 'Practice' && (
        <div className="tab-panel" role="tabpanel">
          <div className="lesson-block">
            <h3>Homework</h3>
            <ul>
              <li>Write five sentences contrasting two habits.</li>
              <li>Record a 60-second voice memo about your weekend.</li>
            </ul>
          </div>
          <div className="lesson-block">
            <h3>Practice exercises</h3>
            <p className="analytics-note">Fill in the blank, multiple choice and translation — marked as they answer.</p>
          </div>
        </div>
      )}

      {lessonTab === 'Vocabulary' && (
        <div className="tab-panel" role="tabpanel">
          <div className="lesson-block k-chart-card">
            <h3>Vocabulary by JLPT level</h3>
            <VocabLevelChart distribution={SAMPLE_VOCAB} height={132} />
          </div>
          <div className="lesson-block">
            <h3>Words from this lesson</h3>
            <div className="example">
              <span className="jp">練習</span> <span className="romaji">renshuu</span><span className="jlpt sm"> N4</span>
              <br />practice
            </div>
          </div>
        </div>
      )}
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

          {Object.keys(brand.heights).length > 0 && (
            <>
              <span className="k-field-label">Block heights</span>
              <div className="k-hlist">
                {Object.entries(brand.heights).map(([id, h]) => (
                  <button key={id} type="button" className="k-hchip" onClick={() => clearHeight(id as BlockId)} title="Reset to fit content">
                    {BLOCK_LABELS[id as BlockId]} <b>{h}px</b> <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            </>
          )}
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
          <span className="k-preview-label">
            {view === 'dashboard' ? 'Student view · drag to rearrange' : 'Student view · lesson recap'}
          </span>
          <div className="k-preview-switches">
            <div className="k-seg" style={{ margin: 0, width: 210 }}>
              <button className={view === 'dashboard' ? 'on' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
              <button className={view === 'lesson' ? 'on' : ''} onClick={() => setView('lesson')}>Lesson recap</button>
            </div>
            <div className="k-seg" style={{ margin: 0, width: 168 }}>
              <button className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>Desktop</button>
              <button className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>Phone</button>
            </div>
          </div>
        </div>

        <div className={`k-preview-frame ${device} ${backgroundClass(brand)}`} style={vars}>
          {view === 'dashboard' ? (
            <>
              <div className="k-preview-top">
                <span className="k-preview-mark" style={{ background: `${brand.accent}22`, color: brand.accent }}>{brand.logoText || '📚'}</span>
                <div>
                  <div className="k-preview-hello">Welcome back,</div>
                  <div className="k-preview-name">Derek</div>
                </div>
              </div>

              {/* Keyed on `device`: the charts measure their container once on
                  mount, so switching width has to remount them or they keep
                  drawing at the old size. */}
              <div key={device} className={`k-preview-grid ${device} ${grab ? 'dragging' : ''}`}>
                {column('main')}
                {column('rail')}
              </div>
            </>
          ) : (
            lessonPreview()
          )}
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          {view === 'dashboard' ? (
            <>
              Grab any block and drop it where you want — including across the two columns. Drag a block&rsquo;s
              bottom edge to change its height, or double-click that edge to fit its content again.
              This is {teacherName ? `${teacherName}'s` : 'your'} student dashboard; save to publish it.
            </>
          ) : (
            <>The recap page every lesson opens into. Its layout is fixed, but your colour, corners and background carry across — switch tabs to check them all.</>
          )}
        </p>
      </div>
    </div>
  )
}
