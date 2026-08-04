'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import {
  ACCENT_PRESETS, DEFAULT_BRAND, BLOCK_LABELS, LESSON_BLOCK_LABELS, LESSON_BLOCK_TAB, LESSON_TABS,
  PRESETS, FONTS, brandVars, backgroundClass, clampSpan, GRID_COLS, MIN_BLOCK_H, MAX_BLOCK_H,
  type Brand, type HeroStyle, type BackgroundStyle, type ShapeStyle, type PropStyle,
  type BlockId, type LessonBlockId, type LessonTab, type Placement,
} from '@/lib/brand'
import { MilestoneGauge, MiniTrend, ScoreTrendChart, VocabLevelChart } from './portal/BrandCharts'
import CountUp from './portal/CountUp'

const HEX = /^#[0-9a-fA-F]{6}$/
/** Must match --g on .k-flow, since span maths is done against it. */
const GAP = 12

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

type Scope = 'dash' | 'lesson'
type Axis = 'x' | 'y' | 'xy'
type AnyId = BlockId | LessonBlockId

/** Move `id` to position `to` within a list of placements. */
function moveTo<T extends string>(list: Placement<T>[], id: T, to: number): Placement<T>[] {
  const from = list.findIndex((p) => p.id === id)
  if (from < 0 || from === to) return list
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item)
  return next
}

export default function BrandStudio({ initial, teacherName }: { initial: Brand; teacherName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [brand, setBrand] = useState<Brand>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard')
  const [lessonTab, setLessonTab] = useState<LessonTab>('Progress')

  /** While dragging, the flow renders this working order so blocks reflow live. */
  const [dragId, setDragId] = useState<AnyId | null>(null)
  const [order, setOrder] = useState<Placement<any>[] | null>(null)
  const [resizing, setResizing] = useState<AnyId | null>(null)
  const blockEls = useRef<Partial<Record<string, HTMLDivElement | null>>>({})
  const flowEl = useRef<HTMLDivElement | null>(null)

  const scope: Scope = view === 'dashboard' ? 'dash' : 'lesson'

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

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    setBrand((b) => ({ ...b, ...p.brand }))
    setSaved(false)
  }

  // ── the placements being edited ─────────────────────────────────────────
  /** Recap blocks belong to a tab; only that tab's blocks are arranged here. */
  const inScope = (p: Placement<any>) => scope === 'dash' || LESSON_BLOCK_TAB[p.id as LessonBlockId] === lessonTab
  const stored: Placement<any>[] = scope === 'dash' ? brand.layout : brand.lessonLayout
  const visible = stored.filter(inScope)
  const shown = order ?? visible
  /** The order on screen right now. The pointer handlers are registered once
   *  per drag, so they read the live list from here rather than a closure. */
  const listRef = useRef<Placement<any>[]>(shown)
  listRef.current = shown

  /**
   * Write an edited subsequence back into the stored list, leaving the other
   * tabs' blocks exactly where they were.
   */
  const commit = (next: Placement<any>[]) => {
    const slots = stored.map((p, i) => (inScope(p) ? i : -1)).filter((i) => i >= 0)
    const merged = stored.slice()
    slots.forEach((slotIndex, k) => { if (next[k]) merged[slotIndex] = next[k] })
    set(scope === 'dash' ? 'layout' : 'lessonLayout', merged as never)
  }

  const updateBlock = (id: AnyId, patch: Partial<Placement<any>>) =>
    commit(visible.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  // ── drag to rearrange ───────────────────────────────────────────────────
  /**
   * Pointer events, not HTML5 drag-and-drop. The native API fires `dragover`
   * continuously over a block that has just reflowed under the cursor, so
   * blocks kept swapping themselves the moment two of them touched. Here a
   * swap costs one deliberate crossing of the target's midline.
   */
  const startDrag = (id: AnyId, e: React.PointerEvent) => {
    if (e.button !== 0 || resizing) return
    e.preventDefault()
    const originX = e.clientX, originY = e.clientY
    let active = false

    const onMove = (ev: PointerEvent) => {
      if (!active) {
        // A few pixels of slop so a click on a block is not a drag.
        if (Math.abs(ev.clientX - originX) + Math.abs(ev.clientY - originY) < 5) return
        active = true
        setDragId(id)
      }

      const cur = listRef.current
      const from = cur.findIndex((p) => p.id === id)
      const dragEl = blockEls.current[id]
      if (from < 0 || !dragEl) return

      // The block under the pointer, the dragged one aside.
      let to = -1
      let target: DOMRect | undefined
      for (let i = 0; i < cur.length; i++) {
        if (i === from) continue
        const r = blockEls.current[cur[i].id]?.getBoundingClientRect()
        if (!r) continue
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
          to = i
          target = r
          break
        }
      }
      if (to < 0 || !target) return

      // Only swap once the pointer is past that block's middle, measured along
      // the axis they meet on. Reacting to the edge instead makes a wide block
      // and a narrow one trade places every few pixels.
      const drag = dragEl.getBoundingClientRect()
      const forward = from < to
      const sameRow = Math.abs(target.top - drag.top) < Math.min(target.height, drag.height) * 0.6
      const mid = sameRow ? target.left + target.width / 2 : target.top + target.height / 2
      const at = sameRow ? ev.clientX : ev.clientY
      if (forward ? at < mid : at > mid) return

      const next = moveTo(cur, id, to)
      listRef.current = next
      setOrder(next)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (active) commit(listRef.current)
      setDragId(null)
      setOrder(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  // ── resize ──────────────────────────────────────────────────────────────
  const clampH = (n: number) => Math.max(MIN_BLOCK_H, Math.min(MAX_BLOCK_H, Math.round(n)))

  const startResize = (id: AnyId, axis: Axis, e: React.PointerEvent) => {
    // Stops the browser starting an HTML5 drag from inside the draggable block.
    e.preventDefault()
    e.stopPropagation()
    const el = blockEls.current[id]
    const flow = flowEl.current
    if (!el || !flow) return
    const rect = el.getBoundingClientRect()
    const startX = e.clientX, startY = e.clientY
    const startW = rect.width
    const startH = (visible.find((p) => p.id === id)?.h) ?? rect.height
    // One column, including the gap that follows it.
    const colW = (flow.getBoundingClientRect().width + GAP) / GRID_COLS
    setResizing(id)
    setSaved(false)

    const onMove = (ev: PointerEvent) => {
      const patch: Partial<Placement<any>> = {}
      if (axis !== 'y') patch.w = clampSpan(Math.round((startW + (ev.clientX - startX) + GAP) / colW))
      if (axis !== 'x') patch.h = clampH(startH + (ev.clientY - startY))
      updateBlock(id, patch)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setResizing(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  /** Double-clicking a grip hands that dimension back to the content. */
  const clearSize = (id: AnyId, axis: Axis) => {
    if (axis === 'x') { updateBlock(id, { w: GRID_COLS }); return }
    const next = visible.map((p) => {
      if (p.id !== id) return p
      const { h, ...rest } = p
      return axis === 'xy' ? { ...rest, w: GRID_COLS } : rest
    })
    commit(next)
  }

  /** Height left for a chart inside a block the teacher has sized. */
  const chartH = (h: number | undefined, fallback: number) => (h ? Math.max(52, h - 62) : fallback)

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

  /** The miniature of each dashboard block, as it appears in the student view. */
  const dashPreview = (id: BlockId, h?: number): React.ReactNode => {
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
            <div style={{ background: 'var(--c-yellow)', color: 'var(--c-yellow-ink)' }}><span>Lessons</span><b><CountUp value={12} /></b></div>
            <div style={{ background: 'var(--c-blue)' }}><span>Avg score</span><b><CountUp value={7.4} decimals={1} /></b></div>
            <div style={{ background: 'var(--c-purple)' }}><span>Speaking</span><b><CountUp value={41} suffix="%" /></b></div>
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
            <MiniTrend points={SAMPLE_TREND} color={brand.accent} height={chartH(h, 62)} />
          </div>
        )
      case 'vocab':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong>Vocabulary</strong><span>45 words</span></div>
            <VocabLevelChart distribution={SAMPLE_VOCAB} height={chartH(h, 72)} compact />
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
            <MilestoneGauge pct={60} color={brand.accent} height={chartH(h, 92)} compact />
          </div>
        )
      case 'scores':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong>Recent scores</strong><span>Last 5</span></div>
            <ScoreTrendChart points={SAMPLE_SCORES} color={brand.accent} height={chartH(h, 74)} compact />
          </div>
        )
      case 'tests':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Practice tests</strong><span>2</span></div></div>
      case 'speaking':
        return <div className="k-preview-card"><div className="k-preview-row"><strong>Speaking habits</strong><span>54 wpm</span></div></div>
    }
  }

  /** The miniature of each lesson-recap section. */
  const lessonPreview = (id: LessonBlockId, h?: number): React.ReactNode => {
    switch (id) {
      case 'balance':
        return (
          <div className="stat-card" style={{ ['--accent' as any]: 'var(--brand)' }}>
            <div className="stat-card-head"><span className="stat-icon">🗣️</span><span className="stat-card-label">Speaking balance</span></div>
            <div className="stat-card-value"><CountUp value={58} /><span className="stat-unit">%</span> <span className="stat-sep">/</span> <CountUp value={42} /><span className="stat-unit">%</span></div>
            <div className="balance-bars" style={{ marginTop: 'auto' }}>
              <div className="balance-row"><span>Derek</span><div className="balance-track"><div className="balance-fill student" style={{ width: '58%' }} /></div><span>58%</span></div>
              <div className="balance-row"><span>{teacherName ? teacherName.split(' ')[0] : 'You'}</span><div className="balance-track"><div className="balance-fill" style={{ width: '42%' }} /></div><span>42%</span></div>
            </div>
          </div>
        )
      case 'score':
        return (
          <div className="stat-card" style={{ ['--accent' as any]: 'var(--green)' }}>
            <div className="stat-card-head"><span className="stat-icon">⭐</span><span className="stat-card-label">Score</span></div>
            <div className="stat-card-value" style={{ color: 'var(--green)' }}><CountUp value={8.3} decimals={1} /><span className="stat-unit">/10</span></div>
            <span className="stat-chip" style={{ marginTop: 'auto' }}>Confident</span>
          </div>
        )
      case 'grammar':
        return (
          <div className="stat-card" style={{ ['--accent' as any]: '#a36210' }}>
            <div className="stat-card-head"><span className="stat-icon">📚</span><span className="stat-card-label">Grammar density</span></div>
            <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>Rich</div>
            <p className="stat-card-note" style={{ marginTop: 'auto' }}>18 vocabulary items practiced</p>
          </div>
        )
      case 'metrics':
        return (
          <div className="corrections-card">
            <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">⚡</span><span className="stat-card-label">Your speaking, measured</span></div>
            <div className="metric-grid">
              <div className="metric"><div className="mv">54</div><div className="mk">words / min</div><div className="mn">speaking pace</div></div>
              <div className="metric"><div className="mv">2.1s</div><div className="mk">thinking time</div><div className="mn">before you reply</div></div>
              <div className="metric"><div className="mv">41s</div><div className="mk">longest answer</div><div className="mn">best stretch</div></div>
              <div className="metric"><div className="mv">9</div><div className="mk">hesitation words</div><div className="mn">えーと, あの…</div></div>
            </div>
          </div>
        )
      case 'corrections':
        return (
          <div className="corrections-card">
            <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">✍️</span><span className="stat-card-label">Main corrections</span></div>
            <p>「〜だけど」→「〜ですけど」 when you are being polite. You caught this yourself twice.</p>
          </div>
        )
      case 'sections':
        return (
          <div className="lesson-block">
            <h3>What you practised</h3>
            <p>You used けど to contrast two ideas in the same sentence, and kept the polite form all the way through.</p>
          </div>
        )
      case 'notes':
        return (
          <div className="lesson-block">
            <h3>Teacher&rsquo;s Note</h3>
            <p>Lovely progress on longer answers — next time try linking three clauses before pausing.</p>
          </div>
        )
      case 'homework':
        return (
          <div className="lesson-block">
            <h3>Homework</h3>
            <ul>
              <li>Write five sentences contrasting two habits.</li>
              <li>Record a 60-second voice memo about your weekend.</li>
            </ul>
          </div>
        )
      case 'exercises':
        return (
          <div className="lesson-block">
            <h3>Practice exercises</h3>
            <p className="analytics-note">Fill in the blank, multiple choice and translation — marked as they answer.</p>
          </div>
        )
      case 'vocabLevels':
        return (
          <div className="lesson-block k-chart-card">
            <h3>Vocabulary by JLPT level</h3>
            <VocabLevelChart distribution={SAMPLE_VOCAB} height={chartH(h, 120)} />
          </div>
        )
      case 'vocabWords':
        return (
          <div className="lesson-block">
            <h3>Words from this lesson</h3>
            <div className="example">
              <span className="jp">練習</span> <span className="romaji">renshuu</span><span className="jlpt sm"> N4</span>
              <br />practice
            </div>
          </div>
        )
    }
  }

  const labelOf = (id: AnyId) =>
    scope === 'dash' ? BLOCK_LABELS[id as BlockId] : LESSON_BLOCK_LABELS[id as LessonBlockId]

  /** A preview block: draggable to rearrange, with grips on two edges. */
  const block = (p: Placement<any>) => {
    const id = p.id as AnyId
    const off = scope === 'dash' && hidden.has(id as BlockId)
    const isGhost = dragId === id
    return (
      <div
        key={id}
        ref={(el) => { blockEls.current[id] = el }}
        style={{ ['--w' as any]: p.w, ...(p.h ? { height: p.h } : null) }}
        className={['k-pblock', p.h ? 'k-fit' : '', off ? 'off' : '', isGhost ? 'ghost' : '', resizing === id ? 'resizing' : ''].join(' ')}
        title={`Drag to move ${labelOf(id)}`}
        onPointerDown={(e) => startDrag(id, e)}
      >
        <span className="k-pblock-tag">
          {labelOf(id)}{off ? ' · hidden' : ''} · {p.w}/{GRID_COLS}{p.h ? ` · ${p.h}px` : ''}
        </span>
        <div className="k-pblock-body k-fit-body">
          {scope === 'dash' ? dashPreview(id as BlockId, p.h) : lessonPreview(id as LessonBlockId, p.h)}
        </div>
        {(['y', 'x', 'xy'] as Axis[]).map((axis) => (
          <span
            key={axis}
            className={axis === 'y' ? 'k-presize' : axis === 'x' ? 'k-presize-x' : 'k-presize-xy'}
            role="separator"
            aria-label={`Resize ${labelOf(id)} ${axis === 'y' ? 'height' : axis === 'x' ? 'width' : 'both'}`}
            title={axis === 'y' ? 'Drag to change height — double-click to fit content'
              : axis === 'x' ? 'Drag to change width — double-click for full width'
              : 'Drag to resize — double-click to reset'}
            draggable={false}
            onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
            onPointerDown={(e) => startResize(id, axis, e)}
            onDoubleClick={(e) => { e.stopPropagation(); clearSize(id, axis) }}
          />
        ))}
      </div>
    )
  }

  /** The arrangeable canvas — shared by the dashboard and the recap preview. */
  const flow = () => (
    <div
      ref={flowEl}
      key={`${scope}-${lessonTab}-${device}`}
      className={`k-flow ${device === 'mobile' ? 'narrow' : ''} ${dragId ? 'dragging' : ''}`}
    >
      {shown.map((p) => block(p))}
      {shown.length === 0 && <div className="k-flow-empty">Nothing on this tab</div>}
    </div>
  )

  const activePreset = PRESETS.find(
    (p) => p.brand.accent.toLowerCase() === brand.accent.toLowerCase()
      && p.brand.font === brand.font && p.brand.shape === brand.shape && p.brand.background === brand.background,
  )

  return (
    <div className="k-studio">
      {/* ── controls ── */}
      <div className="k-studio-controls">
        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon" aria-hidden>✨</span>
            <div>
              <h3>Presets</h3>
              <p className="desc">A complete look — colour, type, texture and how the blocks are arranged.</p>
            </div>
          </div>

          <div className="k-presets">
            {PRESETS.map((p) => {
              const font = FONTS.find((f) => f.value === p.brand.font) ?? FONTS[0]
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`k-preset-card ${activePreset?.id === p.id ? 'sel' : ''}`}
                  onClick={() => applyPreset(p.id)}
                  title={p.hint}
                >
                  <span className={`k-preset-swatch k-bg-${p.brand.background}`} style={{ background: p.brand.accent, ['--bg-ink' as any]: 'rgba(255,255,255,.28)', ['--bg-tint' as any]: 'rgba(255,255,255,.2)' }}>
                    <b style={{ fontFamily: `${font.head}, system-ui, sans-serif` }}>Aa</b>
                    <i />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.hint}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon" aria-hidden>🎨</span>
            <div>
              <h3>Colour &amp; type</h3>
              <p className="desc">Used for buttons, active states and headings.</p>
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

          <span className="k-field-label">Font pairing</span>
          <div className="k-choices">
            {FONTS.map((f) => (
              <button key={f.value} type="button" className={`k-choice ${brand.font === f.value ? 'sel' : ''}`} onClick={() => set('font', f.value)}>
                <span className="k-choice-tick" aria-hidden>✓</span>
                <span style={{ fontFamily: `${f.head}, system-ui, sans-serif` }}>{f.label}<small style={{ fontFamily: 'inherit' }}>{f.hint}</small></span>
              </button>
            ))}
          </div>

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
          <span className="k-preview-label">
            {view === 'dashboard' ? 'Student dashboard' : 'Lesson recap'} · drag to arrange, pull an edge to resize
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
              {flow()}
            </>
          ) : (
            <div className="k-lpview">
              <span className="k-back">← Dashboard</span>

              <header className="k-phead">
                <div>
                  <div className="k-phead-eyebrow">Lesson 12 · Recap</div>
                  <h1>Contrasting ideas with けど</h1>
                  <div className="k-pmeta"><span>12th lesson</span><span>2 Aug</span><span>Confident</span></div>
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

              {flow()}
            </div>
          )}
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          Drag any block to move it. Pull its bottom edge for height, its right edge for width, the corner for
          both — the text inside scales to whatever size you give it, and blocks slide up beside each other when
          there is room. Double-click an edge to hand that dimension back to the content.
          {view === 'lesson' && ' Each recap tab is arranged separately.'}
          {' '}This is {teacherName ? `${teacherName}'s` : 'your'} student portal; save to publish it.
        </p>
      </div>
    </div>
  )
}
