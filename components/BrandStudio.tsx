'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import {
  ACCENT_PRESETS, DEFAULT_BRAND, BLOCK_LABELS, BLOCK_TEXT_SLOTS, BLOCK_TOGGLE,
  DASHBOARD_BLOCKS, DASH_BLOCK_TAB, DASH_TABS, LESSON_BLOCK_LABELS, LESSON_BLOCK_TAB, LESSON_TABS,
  PRESETS, FONTS, TEXT_SLOTS, brandVars, backgroundClass, clampSpan, GRID_COLS, MIN_BLOCK_H, MAX_BLOCK_H,
  MAX_LEVELS, MAX_LEVEL_LESSONS, resolveLevels,
  type Brand, type HeroStyle, type BackgroundStyle, type ShapeStyle, type PropStyle,
  type BlockId, type DashTab, type LessonBlockId, type LessonTab, type Level, type Placement,
  type TextSlot,
} from '@/lib/brand'
import { MilestoneTrack, MiniTrend, ScoreTrendChart, VocabLevelChart } from './portal/BrandCharts'
import CountUp from './portal/CountUp'

const HEX = /^#[0-9a-fA-F]{6}$/
/** Must match --g on .k-flow, since span maths is done against it. */
const GAP = 12

/**
 * The canvas is a fixed page, not a fluid one: what a teacher arranges has to
 * be what a student on a laptop gets, so the widths they choose mean the same
 * thing on both. 1180 is the student portal's own content width at 1280 wide,
 * rail and padding removed. Too narrow a pane scales the whole page down
 * rather than reflowing it.
 */
const CANVAS_WIDTH = { desktop: 1180, mobile: 390 } as const

const BRAND_TEXT_LABELS: Record<string, string> = {
  headline: 'Hero headline',
  welcome: 'Hero subtext',
  logoText: 'Portal mark',
  portalName: 'Portal name',
}

/** Human name for whichever piece of text is being edited. */
const textLabel = (key: string) =>
  key.startsWith('label:') ? `“${TEXT_SLOTS[key.slice(6) as TextSlot]}”` : BRAND_TEXT_LABELS[key] ?? 'Text'

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

/** One row per block: the switch, and whatever that block can be told. */
const TOGGLES: { id: BlockId; hint: string }[] = [
  { id: 'hero', hint: 'The headline panel at the top' },
  { id: 'stats', hint: 'Lessons, average score, speaking share' },
  { id: 'lessons', hint: 'The rolling list of their lessons' },
  { id: 'calendar', hint: 'The month, with lesson days marked' },
  { id: 'milestone', hint: 'Progress toward their next level' },
  { id: 'scores', hint: 'The last few lesson scores' },
  { id: 'progress', hint: 'Score, talk-time and vocabulary trends' },
  { id: 'vocab', hint: 'Words learned by level' },
  { id: 'tests', hint: 'Tests you publish to them' },
  { id: 'speaking', hint: 'Pace and thinking time' },
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

/**
 * One tool drawer in the studio menu: a header that opens its body. Defined at
 * module scope on purpose — a component declared inside BrandStudio would be a
 * new type on every render, and React would remount the open drawer (and drop
 * the caret out of whatever field was being typed in) on every keystroke.
 */
function Tool({ id, icon, tone = '', title, desc, openId, onOpen, children }: {
  id: string; icon: string; tone?: string; title: string; desc: string
  openId: string | null; onOpen: (id: string | null) => void; children: React.ReactNode
}) {
  const open = openId === id
  return (
    <section className={`k-sec k-tool ${open ? 'open' : ''}`}>
      <button type="button" className="k-tool-head" aria-expanded={open} onClick={() => onOpen(open ? null : id)}>
        <span className={`k-sec-icon ${tone}`} aria-hidden>{icon}</span>
        <span className="k-tool-title">
          <strong>{title}</strong>
          {open && <span className="desc">{desc}</span>}
        </span>
        <span className="k-tool-chev" aria-hidden>▾</span>
      </button>
      {open && <div className="k-tool-body">{children}</div>}
    </section>
  )
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
  const [dashTab, setDashTab] = useState<DashTab>('Overview')
  /** One tool open at a time — the menu is a stack of drawers, not a page. */
  const [tool, setTool] = useState<string | null>('presets')
  /** Which block's options are unfolded under its switch. */
  const [openOptions, setOpenOptions] = useState<BlockId | null>(null)

  /** While dragging, the flow renders this working order so blocks reflow live. */
  const [dragId, setDragId] = useState<AnyId | null>(null)
  const [order, setOrder] = useState<Placement<any>[] | null>(null)
  const [resizing, setResizing] = useState<AnyId | null>(null)
  const blockEls = useRef<Partial<Record<string, HTMLDivElement | null>>>({})
  const flowEl = useRef<HTMLDivElement | null>(null)
  const canvasEl = useRef<HTMLDivElement | null>(null)
  const frameEl = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  /** Pointer maths runs in screen pixels; sizes are stored in canvas pixels. */
  const scaleRef = useRef(1)
  scaleRef.current = scale

  const scope: Scope = view === 'dashboard' ? 'dash' : 'lesson'

  // Fit the fixed-width canvas into whatever pane it has, and keep the space
  // it occupies in the layout equal to its scaled height.
  useEffect(() => {
    const wrap = canvasEl.current
    const frame = frameEl.current
    if (!wrap || !frame) return
    const fit = () => {
      const next = Math.min(1, wrap.clientWidth / CANVAS_WIDTH[device])
      setScale((s) => (Math.abs(s - next) > 0.001 ? next : s))
      const h = `${Math.round(frame.offsetHeight * next)}px`
      if (wrap.style.height !== h) wrap.style.height = h
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [device, view, dashTab, lessonTab, brand])

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
  /** Blocks the student won't see: switched off here, gone from the canvas. */
  const hidden = new Set<BlockId>(DASHBOARD_BLOCKS.filter((id) => !brand[BLOCK_TOGGLE[id]]))

  /**
   * Both views are tabbed, and each tab is arranged on its own. A block that
   * is switched off is out of scope entirely — the student's page drops it, so
   * the canvas has to as well, or the teacher is arranging something nobody
   * will ever see.
   */
  const inScope = (p: Placement<any>) =>
    scope === 'dash'
      ? DASH_BLOCK_TAB[p.id as BlockId] === dashTab && !hidden.has(p.id as BlockId)
      : LESSON_BLOCK_TAB[p.id as LessonBlockId] === lessonTab
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
    // The canvas is scaled, so every screen measurement is divided back into
    // canvas pixels before it is compared with a stored size.
    const s = scaleRef.current || 1
    const rect = el.getBoundingClientRect()
    const startX = e.clientX, startY = e.clientY
    const startW = rect.width / s
    const startH = (visible.find((p) => p.id === id)?.h) ?? rect.height / s
    // One column, including the gap that follows it.
    const colW = (flow.getBoundingClientRect().width / s + GAP) / GRID_COLS
    setResizing(id)
    setSaved(false)

    const onMove = (ev: PointerEvent) => {
      const patch: Partial<Placement<any>> = {}
      if (axis !== 'y') patch.w = clampSpan(Math.round((startW + (ev.clientX - startX) / s + GAP) / colW))
      if (axis !== 'x') patch.h = clampH(startH + (ev.clientY - startY) / s)
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

  // ── text edited on the canvas ───────────────────────────────────────────
  /**
   * The words are typed straight onto the preview. contentEditable owns the
   * text while it is being typed — handing React the value back as children
   * would rewrite the node on every keystroke and drop the caret at the front
   * — so children are pinned to the value this field mounted with, and the
   * effect below only writes when the value changes from somewhere else (a
   * preset, or Reset).
   */
  type TextKey = 'headline' | 'welcome' | 'logoText' | 'portalName' | `label:${TextSlot}`
  const valueOf = (key: TextKey) =>
    key.startsWith('label:') ? brand.labels[key.slice(6) as TextSlot] : (brand as any)[key] as string
  const writeText = (key: TextKey, text: string) => {
    if (key.startsWith('label:')) {
      const slot = key.slice(6) as TextSlot
      set('labels', { ...brand.labels, [slot]: text.trim() || TEXT_SLOTS[slot] })
    } else {
      set(key as 'headline', text as never)
    }
  }
  const textEls = useRef<Partial<Record<TextKey, HTMLElement | null>>>({})
  const mounted = useRef<Partial<Record<TextKey, string>>>({})
  const pin = (key: TextKey) => (mounted.current[key] ??= valueOf(key))

  useEffect(() => {
    for (const key of Object.keys(textEls.current) as TextKey[]) {
      const el = textEls.current[key]
      const v = valueOf(key)
      if (el && v !== undefined && el.innerText !== v) el.innerText = v
    }
  })

  const editable = (key: TextKey, { multiline = false, max = 120 }: { multiline?: boolean; max?: number } = {}) => ({
    ref: (el: HTMLElement | null) => { textEls.current[key] = el },
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: false,
    role: 'textbox',
    'aria-label': textLabel(key),
    title: `Click to edit — ${textLabel(key)}`,
    className: 'k-inline',
    // Editing beats dragging: this text must take the pointer, and the block
    // underneath must not read the click as the start of a move.
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onKeyDown: (e: React.KeyboardEvent) => {
      e.stopPropagation()
      if (e.key === 'Escape' || (e.key === 'Enter' && !multiline)) {
        e.preventDefault()
        ;(e.target as HTMLElement).blur()
      }
    },
    onPaste: (e: React.ClipboardEvent) => {
      e.preventDefault()
      const raw = e.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, multiline ? raw : raw.replace(/\s*[\r\n]+\s*/g, ' '))
    },
    onInput: (e: React.FormEvent<HTMLElement>) => {
      const el = e.currentTarget
      let text = el.innerText.replace(/ /g, ' ').replace(/\n$/, '')
      if (text.length > max) {
        text = text.slice(0, max)
        el.innerText = text
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
      writeText(key, text)
    },
  })

  // ── milestone ladder ────────────────────────────────────────────────────
  const setLevels = (next: Level[]) => set('levels', next)
  const patchLevel = (i: number, patch: Partial<Level>) =>
    setLevels(brand.levels.map((l, k) => (k === i ? { ...l, ...patch } : l)))
  const addLevel = () => {
    const last = brand.levels[brand.levels.length - 1]
    setLevels([...brand.levels, { name: 'New level', lessons: Math.min(MAX_LEVEL_LESSONS, (last?.lessons ?? 0) + 5) }])
  }
  const removeLevel = (i: number) => setLevels(brand.levels.filter((_, k) => k !== i))
  /** Re-order and de-duplicate once the teacher has stopped typing numbers. */
  const settleLevels = () => setLevels(resolveLevels(brand.levels))

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
            <strong {...editable('headline', { multiline: true, max: 90 })} style={{ whiteSpace: 'pre-line' }}>{pin('headline')}</strong>
            <p {...editable('welcome', { multiline: true, max: 200 })} style={{ color: heroSub }}>{pin('welcome')}</p>
            <span className="k-preview-btn" style={{ background: brand.heroStyle === 'light' ? brand.accent : '#fff', color: brand.heroStyle === 'light' ? '#fff' : brand.accent }}>
              <span {...editable('label:heroButton', { max: 40 })}>{pin('label:heroButton')}</span>
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
            {/* White cards told apart by a rule, the same as the real ones. */}
            <div className="one"><span {...editable('label:statLessons', { max: 24 })}>{pin('label:statLessons')}</span><b><CountUp value={12} /></b></div>
            <div className="two"><span {...editable('label:statScore', { max: 24 })}>{pin('label:statScore')}</span><b><CountUp value={7.4} decimals={1} /></b></div>
            <div className="three"><span {...editable('label:statSpeaking', { max: 24 })}>{pin('label:statSpeaking')}</span><b><CountUp value={41} suffix="%" /></b></div>
          </div>
        )
      case 'lessons':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong {...editable('label:lessonsTitle', { max: 40 })}>{pin('label:lessonsTitle')}</strong><span>12</span></div>
            <div className="k-preview-lessons">
              <div><i style={{ background: brand.accent }} />Contrasting ideas<span>7.2</span></div>
              <div><i style={{ background: `${brand.accent}66` }} />Giving reasons<span>6.8</span></div>
            </div>
          </div>
        )
      case 'progress':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong {...editable('label:progressTitle', { max: 40 })}>{pin('label:progressTitle')}</strong><span>Score</span></div>
            <MiniTrend points={SAMPLE_TREND} color={brand.accent} height={chartH(h, 62)} />
          </div>
        )
      case 'vocab':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong {...editable('label:vocabTitle', { max: 40 })}>{pin('label:vocabTitle')}</strong><span>45 words</span></div>
            <VocabLevelChart distribution={SAMPLE_VOCAB} height={chartH(h, 72)} compact />
          </div>
        )
      case 'calendar':
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong {...editable('label:calendarTitle', { max: 40 })}>{pin('label:calendarTitle')}</strong><span>22</span></div>
            <div className="k-preview-cal" aria-hidden>
              {Array.from({ length: 14 }).map((_, i) => (
                <i key={i} style={i === 4 ? { background: brand.accent } : undefined} />
              ))}
            </div>
          </div>
        )
      case 'milestone': {
        const sample = Math.max(1, Math.round((brand.levels[brand.levels.length - 1]?.lessons ?? 10) * 0.45))
        return (
          <div className="k-preview-card">
            <div className="k-preview-row"><strong {...editable('label:milestoneTitle', { max: 40 })}>{pin('label:milestoneTitle')}</strong><span>{brand.levels.find((l) => l.lessons > sample)?.name ?? brand.levels[brand.levels.length - 1]?.name}</span></div>
            <div style={{ marginTop: 10 }}>
              <MilestoneTrack levels={brand.levels} lessonCount={sample} color={brand.accent} />
            </div>
          </div>
        )
      }
      case 'scores':
        return (
          <div className="k-preview-card k-chart-card">
            <div className="k-preview-row"><strong {...editable('label:scoresTitle', { max: 40 })}>{pin('label:scoresTitle')}</strong><span>Last 5</span></div>
            <ScoreTrendChart points={SAMPLE_SCORES} color={brand.accent} height={chartH(h, 74)} compact />
          </div>
        )
      case 'tests':
        return <div className="k-preview-card"><div className="k-preview-row"><strong {...editable('label:testsTitle', { max: 40 })}>{pin('label:testsTitle')}</strong><span>2</span></div></div>
      case 'speaking':
        return <div className="k-preview-card"><div className="k-preview-row"><strong {...editable('label:speakingTitle', { max: 40 })}>{pin('label:speakingTitle')}</strong><span>54 wpm</span></div></div>
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
        <Tool id="presets" icon="✨" tone="" title="Presets" desc="A complete look — colour, type, texture and how the blocks are arranged." openId={tool} onOpen={setTool}>

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
        </Tool>

        <Tool id="colour" icon="🎨" tone="" title="Colour &amp; type" desc="Used for buttons, active states and headings." openId={tool} onOpen={setTool}>

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
        </Tool>

        <Tool id="words" icon="✍️" tone="y" title="Words" desc="The hero lines and the portal name — or click them on the preview and type there." openId={tool} onOpen={setTool}>

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
        </Tool>

        <Tool id="texture" icon="🖼️" tone="b" title="Background &amp; shape" desc="The texture behind the portal and how round everything is." openId={tool} onOpen={setTool}>

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
        </Tool>

        <Tool id="sections" icon="🧩" tone="p" title="Sections" desc="Switch off anything that doesn't fit how you teach — it leaves the canvas and the student's page together. Each one keeps its own settings under Options." openId={tool} onOpen={setTool}>
          <div className="k-toggles">
            {TOGGLES.map((t) => {
              const key = BLOCK_TOGGLE[t.id]
              const on = Boolean(brand[key])
              const slots = BLOCK_TEXT_SLOTS[t.id] ?? []
              const hasOptions = slots.length > 0 || t.id === 'milestone'
              const unfolded = openOptions === t.id
              return (
                <div className={`k-toggle-block ${unfolded ? 'open' : ''}`} key={t.id}>
                  <div className="k-toggle-row">
                    <div>
                      <div className="k-hw-title">{BLOCK_LABELS[t.id]}</div>
                      <div className="k-hw-due">{t.hint}</div>
                    </div>
                    {hasOptions && (
                      <button
                        type="button"
                        className="k-opt-btn"
                        aria-expanded={unfolded}
                        onClick={() => setOpenOptions(unfolded ? null : t.id)}
                      >
                        Options <span aria-hidden>▾</span>
                      </button>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={BLOCK_LABELS[t.id]}
                      className={`k-switch ${on ? 'on' : ''}`}
                      onClick={() => set(key, !on as never)}
                    />
                  </div>

                  {hasOptions && unfolded && (
                    <div className="k-toggle-opts">
                      {slots.map((slot) => (
                        <label className="k-field" key={slot}>
                          <span>{TEXT_SLOTS[slot]}</span>
                          <input
                            value={brand.labels[slot]}
                            onChange={(e) => set('labels', { ...brand.labels, [slot]: e.target.value.slice(0, 40) })}
                            onBlur={(e) => { if (!e.target.value.trim()) set('labels', { ...brand.labels, [slot]: TEXT_SLOTS[slot] }) }}
                            placeholder={TEXT_SLOTS[slot]}
                          />
                        </label>
                      ))}

                      {t.id === 'milestone' && (
                        <>
                          <span className="k-field-label">Levels</span>
                          <p className="desc" style={{ marginBottom: 8 }}>What each level is called and how many lessons it takes. The bar fills as they get there.</p>
                          <div className="k-levels">
                            {brand.levels.map((lvl, i) => (
                              <div className="k-level-row" key={i}>
                                <input
                                  value={lvl.name}
                                  onChange={(e) => patchLevel(i, { name: e.target.value.slice(0, 24) })}
                                  placeholder="Level name"
                                  aria-label={`Level ${i + 1} name`}
                                />
                                <input
                                  type="number"
                                  min={1}
                                  max={MAX_LEVEL_LESSONS}
                                  value={lvl.lessons}
                                  onChange={(e) => patchLevel(i, { lessons: Number(e.target.value) })}
                                  onBlur={settleLevels}
                                  aria-label={`Lessons to reach ${lvl.name || `level ${i + 1}`}`}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger-ghost btn-sm"
                                  onClick={() => removeLevel(i)}
                                  disabled={brand.levels.length <= 1}
                                  aria-label={`Remove ${lvl.name || `level ${i + 1}`}`}
                                >✕</button>
                              </div>
                            ))}
                          </div>
                          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 9 }} onClick={addLevel} disabled={brand.levels.length >= MAX_LEVELS}>
                            + Add level
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="k-toggle-block" style={{ marginTop: 4 }}>
            <div className="k-toggle-row">
              <div>
                <div className="k-hw-title">Tab names</div>
                <div className="k-hw-due">What the three tabs are called</div>
              </div>
              <button type="button" className="k-opt-btn" aria-expanded={openOptions === ('tabs' as any)} onClick={() => setOpenOptions(openOptions === ('tabs' as any) ? null : ('tabs' as any))}>
                Options <span aria-hidden>▾</span>
              </button>
            </div>
            {openOptions === ('tabs' as any) && (
              <div className="k-toggle-opts">
                {(['tabOverview', 'tabLessons', 'tabProgress'] as TextSlot[]).map((slot) => (
                  <label className="k-field" key={slot}>
                    <span>{TEXT_SLOTS[slot]}</span>
                    <input
                      value={brand.labels[slot]}
                      onChange={(e) => set('labels', { ...brand.labels, [slot]: e.target.value.slice(0, 40) })}
                      onBlur={(e) => { if (!e.target.value.trim()) set('labels', { ...brand.labels, [slot]: TEXT_SLOTS[slot] }) }}
                      placeholder={TEXT_SLOTS[slot]}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </Tool>

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
            {view === 'dashboard' ? 'Student dashboard' : 'Lesson recap'} · click the words to edit, drag to arrange, pull an edge to resize
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

        <div className="k-canvas" ref={canvasEl}>
        <div
          ref={frameEl}
          className={`k-preview-frame ${device} ${backgroundClass(brand)}`}
          style={{ ...vars, ['--canvas-w' as any]: `${CANVAS_WIDTH[device]}px`, ['--canvas-scale' as any]: scale }}
        >
          {view === 'dashboard' ? (
            <>
              <div className="k-preview-top">
                <span {...editable('logoText', { max: 4 })} className="k-preview-mark k-inline" style={{ background: `${brand.accent}22`, color: brand.accent }}>{pin('logoText')}</span>
                <div>
                  <div {...editable('label:greeting', { max: 40 })} className="k-inline k-preview-hello">{pin('label:greeting')}</div>
                  <div className="k-preview-name">Derek</div>
                </div>
                <span {...editable('portalName', { max: 40 })} className="k-inline k-preview-portal">{pin('portalName')}</span>
              </div>
              <div className="k-dtabs">
                {DASH_TABS.map((t) => {
                  const slot = `tab${t}` as TextSlot
                  return (
                    <button key={t} type="button" className={dashTab === t ? 'on' : ''} onClick={() => setDashTab(t)}>
                      <span {...editable(`label:${slot}`, { max: 24 })} onPointerDown={(e) => { e.stopPropagation() }}>{pin(`label:${slot}`)}</span>
                    </button>
                  )
                })}
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
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          Click any of your own words — the headline, the line under it, the mark, the portal name — and type
          straight onto the page. Drag a block to move it. Pull its bottom edge for height, its right edge for
          width, the corner for both; the text inside scales to whatever size you give it, and blocks share the
          height of the row they land in. Double-click an edge to hand that dimension back to the content.
          {view === 'lesson' && ' Each recap tab is arranged separately.'}
          {' '}This is {teacherName ? `${teacherName}'s` : 'your'} student portal; save to publish it.
        </p>
      </div>
    </div>
  )
}
