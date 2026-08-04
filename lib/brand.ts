/**
 * Student-portal branding.
 *
 * Every teacher gets their own look for the view their students see. The
 * values live in `profiles.brand` (JSONB) so the toolkit can add options
 * without a migration; this module owns the shape and the defaults, and is
 * the only place that decides what an unset field falls back to.
 */

export type HeroStyle = 'forest' | 'accent' | 'light'
/** Page background pattern behind the student portal. All CSS, no assets. */
export type BackgroundStyle = 'plain' | 'dots' | 'grid' | 'blobs' | 'rings' | 'waves' | 'wash'
/** How round everything is — cards, buttons, inputs. */
export type ShapeStyle = 'rounded' | 'soft' | 'sharp' | 'pill'
/** Decorative 3D props on the hero. */
export type PropStyle = 'orbs' | 'geometric' | 'minimal' | 'none'

/** Blocks a teacher can arrange on the student dashboard. */
export const DASHBOARD_BLOCKS = [
  'hero', 'stats', 'lessons', 'progress', 'vocab',
  'calendar', 'milestone', 'scores', 'tests', 'speaking',
] as const
export type BlockId = (typeof DASHBOARD_BLOCKS)[number]

export const BLOCK_LABELS: Record<BlockId, string> = {
  hero: 'Welcome banner',
  stats: 'Stat cards',
  lessons: 'Lesson cards',
  progress: 'Progress charts',
  vocab: 'Vocabulary',
  calendar: 'Calendar',
  milestone: 'Milestone',
  scores: 'Recent scores',
  tests: 'Practice tests',
  speaking: 'Speaking habits',
}

/** Tabs on the student's lesson recap page. */
export const LESSON_TABS = ['Progress', 'Lesson', 'Practice', 'Vocabulary'] as const
export type LessonTab = (typeof LESSON_TABS)[number]

/** Arrangeable sections of the lesson recap page. */
export const LESSON_BLOCKS = [
  'balance', 'score', 'grammar', 'metrics', 'corrections',
  'sections', 'notes', 'homework', 'exercises', 'vocabLevels', 'vocabWords',
] as const
export type LessonBlockId = (typeof LESSON_BLOCKS)[number]

export const LESSON_BLOCK_LABELS: Record<LessonBlockId, string> = {
  balance: 'Speaking balance',
  score: 'Score',
  grammar: 'Grammar density',
  metrics: 'Speaking, measured',
  corrections: 'Corrections',
  sections: 'Lesson notes',
  notes: 'Teacher’s note',
  homework: 'Homework',
  exercises: 'Practice exercises',
  vocabLevels: 'Vocabulary by level',
  vocabWords: 'Word list',
}

/** A recap block belongs to one tab; arranging happens inside that tab. */
export const LESSON_BLOCK_TAB: Record<LessonBlockId, LessonTab> = {
  balance: 'Progress', score: 'Progress', grammar: 'Progress', metrics: 'Progress', corrections: 'Progress',
  sections: 'Lesson', notes: 'Lesson',
  homework: 'Practice', exercises: 'Practice',
  vocabLevels: 'Vocabulary', vocabWords: 'Vocabulary',
}

/**
 * Blocks flow left to right and wrap, each one `w` of 12 columns wide with an
 * optional pixel height. Shrinking a block therefore leaves room beside it and
 * the next block moves up into that space — no columns to keep in sync.
 */
export const GRID_COLS = 12
export const MIN_SPAN = 3
export type Placement<T extends string = BlockId> = { id: T; w: number; h?: number }
export type Layout = Placement<BlockId>[]
export type LessonLayout = Placement<LessonBlockId>[]

/** A block left unset sizes to its content; these bound a deliberate resize. */
export const MIN_BLOCK_H = 90
export const MAX_BLOCK_H = 560

/**
 * The milestone ladder. Each rung is a name the student reaches at `lessons`
 * lessons — the teacher owns both, so a course can count in whatever units it
 * teaches in.
 */
export type Level = { name: string; lessons: number }
export const MAX_LEVELS = 8
export const MAX_LEVEL_LESSONS = 999

const DEFAULT_LEVELS: Level[] = [
  { name: 'Sprouting', lessons: 1 },
  { name: 'Blooming', lessons: 5 },
  { name: 'Committed', lessons: 10 },
  { name: 'Advanced', lessons: 25 },
  { name: 'Master', lessons: 50 },
]

/**
 * Where a student stands on the ladder. `pct` is progress through the current
 * rung, not the whole ladder, so the bar fills once per level.
 */
export function levelProgress(levels: Level[], lessonCount: number) {
  const rungs = levels.length ? levels : DEFAULT_LEVELS
  const reached = rungs.filter((l) => l.lessons <= lessonCount)
  const next = rungs.find((l) => l.lessons > lessonCount)
  const from = reached.length ? reached[reached.length - 1].lessons : 0
  const target = next?.lessons ?? rungs[rungs.length - 1].lessons
  const span = Math.max(1, target - from)
  return {
    rungs,
    /** The last rung reached, if any. */
    current: reached[reached.length - 1],
    /** The rung being worked towards — undefined once the ladder is finished. */
    next,
    target,
    remaining: Math.max(0, target - lessonCount),
    pct: next ? Math.max(0, Math.min(100, Math.round(((lessonCount - from) / span) * 100))) : 100,
    /** What to call the thing ahead of them (or the top rung, once done). */
    label: (next ?? rungs[rungs.length - 1]).name,
  }
}

/** Heading + body pairing for the student portal. */
export type FontId = 'modern' | 'techy' | 'editorial' | 'friendly' | 'plain'

export const FONTS: { value: FontId; label: string; hint: string; head: string; body: string }[] = [
  { value: 'modern', label: 'Modern', hint: 'Outfit · Jakarta', head: '"Outfit"', body: '"Plus Jakarta Sans"' },
  { value: 'techy', label: 'Techy', hint: 'Space Grotesk · Inter', head: '"Space Grotesk"', body: '"Inter"' },
  { value: 'editorial', label: 'Editorial', hint: 'Fraunces · Inter', head: '"Fraunces"', body: '"Inter"' },
  { value: 'friendly', label: 'Friendly', hint: 'Nunito', head: '"Nunito"', body: '"Nunito"' },
  { value: 'plain', label: 'Plain', hint: 'Inter', head: '"Inter"', body: '"Inter"' },
]

const FONT_STACK = 'system-ui, sans-serif'

export type Brand = {
  /** Primary colour — buttons, active states, progress fills. */
  accent: string
  /** Big line on the student dashboard hero. */
  headline: string
  /** Supporting line under the headline. */
  welcome: string
  /** Short mark shown in the rail (emoji or 1–2 letters). */
  logoText: string
  /** What the student portal is called. */
  portalName: string
  heroStyle: HeroStyle
  background: BackgroundStyle
  shape: ShapeStyle
  props: PropStyle
  font: FontId
  layout: Layout
  lessonLayout: LessonLayout
  /** Milestone ladder, easiest first. */
  levels: Level[]
  showMilestone: boolean
  showProgress: boolean
  showVocab: boolean
  showTests: boolean
  showSpeaking: boolean
}

/** Wide block beside a narrow one — the two-column look, without columns. */
const DEFAULT_LAYOUT: Layout = [
  { id: 'hero', w: 8 }, { id: 'calendar', w: 4 },
  { id: 'stats', w: 8 }, { id: 'milestone', w: 4 },
  { id: 'lessons', w: 8 }, { id: 'scores', w: 4 },
  { id: 'progress', w: 8 }, { id: 'tests', w: 4 },
  { id: 'vocab', w: 8 }, { id: 'speaking', w: 4 },
]

const DEFAULT_LESSON_LAYOUT: LessonLayout = [
  { id: 'balance', w: 4 }, { id: 'score', w: 4 }, { id: 'grammar', w: 4 },
  { id: 'metrics', w: 12 }, { id: 'corrections', w: 12 },
  { id: 'sections', w: 12 }, { id: 'notes', w: 12 },
  { id: 'homework', w: 6 }, { id: 'exercises', w: 6 },
  { id: 'vocabLevels', w: 5 }, { id: 'vocabWords', w: 7 },
]

export const DEFAULT_BRAND: Brand = {
  accent: '#234f3c',
  headline: 'Learn today,\nsucceed tomorrow!',
  welcome: 'Every lesson recorded, recapped, and turned into practice you can review.',
  logoText: '📚',
  portalName: 'Lesson Studio',
  heroStyle: 'forest',
  background: 'plain',
  shape: 'rounded',
  props: 'orbs',
  font: 'modern',
  layout: DEFAULT_LAYOUT,
  lessonLayout: DEFAULT_LESSON_LAYOUT,
  levels: DEFAULT_LEVELS,
  showMilestone: true,
  showProgress: true,
  showVocab: true,
  showTests: true,
  showSpeaking: true,
}

/**
 * Complete looks. A preset is the whole vibe — colour, type, texture, corners
 * and how the blocks are arranged — so picking one replaces the arrangement
 * too, not just the palette.
 */
export type Preset = {
  id: string
  name: string
  hint: string
  brand: Pick<Brand, 'accent' | 'heroStyle' | 'background' | 'shape' | 'props' | 'font' | 'layout' | 'lessonLayout'>
}

export const PRESETS: Preset[] = [
  {
    id: 'forest',
    name: 'Forest',
    hint: 'The classic — calm green, generous corners',
    brand: {
      accent: '#234f3c', heroStyle: 'forest', background: 'plain', shape: 'rounded', props: 'orbs', font: 'modern',
      layout: DEFAULT_LAYOUT, lessonLayout: DEFAULT_LESSON_LAYOUT,
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    hint: 'Deep indigo, tight corners, data first',
    brand: {
      accent: '#4338ca', heroStyle: 'accent', background: 'grid', shape: 'soft', props: 'geometric', font: 'techy',
      layout: [
        { id: 'stats', w: 12 },
        { id: 'progress', w: 8 }, { id: 'scores', w: 4 },
        { id: 'hero', w: 12 },
        { id: 'lessons', w: 8 }, { id: 'milestone', w: 4 },
        { id: 'vocab', w: 6 }, { id: 'speaking', w: 6 },
        { id: 'calendar', w: 6 }, { id: 'tests', w: 6 },
      ],
      lessonLayout: [
        { id: 'score', w: 3 }, { id: 'balance', w: 5 }, { id: 'grammar', w: 4 },
        { id: 'metrics', w: 12 }, { id: 'corrections', w: 12 },
        { id: 'sections', w: 12 }, { id: 'notes', w: 12 },
        { id: 'homework', w: 5 }, { id: 'exercises', w: 7 },
        { id: 'vocabLevels', w: 6 }, { id: 'vocabWords', w: 6 },
      ],
    },
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    hint: 'Warm clay, soft wash, welcoming',
    brand: {
      accent: '#b45309', heroStyle: 'accent', background: 'wash', shape: 'rounded', props: 'orbs', font: 'friendly',
      layout: [
        { id: 'hero', w: 12 },
        { id: 'stats', w: 12 },
        { id: 'lessons', w: 7 }, { id: 'calendar', w: 5 },
        { id: 'milestone', w: 4 }, { id: 'scores', w: 4 }, { id: 'speaking', w: 4 },
        { id: 'progress', w: 8 }, { id: 'tests', w: 4 },
        { id: 'vocab', w: 12 },
      ],
      lessonLayout: DEFAULT_LESSON_LAYOUT,
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    hint: 'Serif headlines, plum accent, roomy',
    brand: {
      accent: '#7e22ce', heroStyle: 'light', background: 'plain', shape: 'sharp', props: 'minimal', font: 'editorial',
      layout: [
        { id: 'hero', w: 12 },
        { id: 'lessons', w: 12 },
        { id: 'stats', w: 8 }, { id: 'milestone', w: 4 },
        { id: 'progress', w: 12 },
        { id: 'vocab', w: 6 }, { id: 'scores', w: 6 },
        { id: 'calendar', w: 6 }, { id: 'tests', w: 3 }, { id: 'speaking', w: 3 },
      ],
      lessonLayout: [
        { id: 'score', w: 4 }, { id: 'balance', w: 8 },
        { id: 'grammar', w: 4 }, { id: 'metrics', w: 8 },
        { id: 'corrections', w: 12 }, { id: 'sections', w: 12 }, { id: 'notes', w: 12 },
        { id: 'homework', w: 12 }, { id: 'exercises', w: 12 },
        { id: 'vocabLevels', w: 12 }, { id: 'vocabWords', w: 12 },
      ],
    },
  },
  {
    id: 'playful',
    name: 'Playful',
    hint: 'Pink, pill corners, everything in view',
    brand: {
      accent: '#be123c', heroStyle: 'accent', background: 'dots', shape: 'pill', props: 'orbs', font: 'friendly',
      layout: [
        { id: 'hero', w: 8 }, { id: 'milestone', w: 4 },
        { id: 'stats', w: 12 },
        { id: 'scores', w: 4 }, { id: 'speaking', w: 4 }, { id: 'tests', w: 4 },
        { id: 'lessons', w: 7 }, { id: 'calendar', w: 5 },
        { id: 'progress', w: 6 }, { id: 'vocab', w: 6 },
      ],
      lessonLayout: DEFAULT_LESSON_LAYOUT,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    hint: 'Slate, no ornament, one column',
    brand: {
      accent: '#334155', heroStyle: 'light', background: 'plain', shape: 'soft', props: 'none', font: 'plain',
      layout: [
        { id: 'hero', w: 12 }, { id: 'stats', w: 12 }, { id: 'lessons', w: 12 },
        { id: 'progress', w: 12 }, { id: 'scores', w: 6 }, { id: 'milestone', w: 6 },
        { id: 'vocab', w: 12 }, { id: 'calendar', w: 6 }, { id: 'tests', w: 3 }, { id: 'speaking', w: 3 },
      ],
      lessonLayout: DEFAULT_LESSON_LAYOUT,
    },
  },
]

/** Accent presets offered in the toolkit — friendly, high-contrast on white. */
export const ACCENT_PRESETS = [
  { name: 'Forest', value: '#234f3c' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Ocean', value: '#0369a1' },
  { name: 'Plum', value: '#7e22ce' },
  { name: 'Clay', value: '#b45309' },
  { name: 'Rose', value: '#be123c' },
  { name: 'Slate', value: '#334155' },
  { name: 'Teal', value: '#0f766e' },
] as const

export const BACKGROUNDS = ['plain', 'dots', 'grid', 'blobs', 'rings', 'waves', 'wash'] as const
export const SHAPES = ['rounded', 'soft', 'sharp', 'pill'] as const
export const PROPS = ['orbs', 'geometric', 'minimal', 'none'] as const

/** Corner radii per shape, mapped onto the tokens the whole UI already uses. */
const SHAPE_RADII: Record<ShapeStyle, { md: string; lg: string; xl: string }> = {
  rounded: { md: '16px', lg: '22px', xl: '28px' },
  soft:    { md: '12px', lg: '16px', xl: '20px' },
  sharp:   { md: '4px',  lg: '6px',  xl: '8px'  },
  pill:    { md: '20px', lg: '28px', xl: '36px' },
}

const HEX = /^#[0-9a-fA-F]{6}$/

/** Merge a stored (possibly partial or malformed) brand onto the defaults. */
export function resolveBrand(raw: unknown): Brand {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Partial<Brand> & { heights?: unknown }
  const str = (v: unknown, fallback: string, max = 240) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

  return {
    accent: typeof b.accent === 'string' && HEX.test(b.accent) ? b.accent : DEFAULT_BRAND.accent,
    headline: str(b.headline, DEFAULT_BRAND.headline, 90),
    welcome: str(b.welcome, DEFAULT_BRAND.welcome, 200),
    logoText: str(b.logoText, DEFAULT_BRAND.logoText, 4),
    portalName: str(b.portalName, DEFAULT_BRAND.portalName, 40),
    heroStyle: b.heroStyle === 'accent' || b.heroStyle === 'light' ? b.heroStyle : DEFAULT_BRAND.heroStyle,
    background: (BACKGROUNDS as readonly string[]).includes(b.background as string) ? (b.background as BackgroundStyle) : DEFAULT_BRAND.background,
    shape: (SHAPES as readonly string[]).includes(b.shape as string) ? (b.shape as ShapeStyle) : DEFAULT_BRAND.shape,
    props: (PROPS as readonly string[]).includes(b.props as string) ? (b.props as PropStyle) : DEFAULT_BRAND.props,
    font: FONTS.some((f) => f.value === b.font) ? (b.font as FontId) : DEFAULT_BRAND.font,
    layout: resolveLayout(b.layout, b.heights),
    lessonLayout: resolveLessonLayout(b.lessonLayout),
    levels: resolveLevels(b.levels),
    showMilestone: bool(b.showMilestone, DEFAULT_BRAND.showMilestone),
    showProgress: bool(b.showProgress, DEFAULT_BRAND.showProgress),
    showVocab: bool(b.showVocab, DEFAULT_BRAND.showVocab),
    showTests: bool(b.showTests, DEFAULT_BRAND.showTests),
    showSpeaking: bool(b.showSpeaking, DEFAULT_BRAND.showSpeaking),
  }
}

export const clampSpan = (n: unknown, fallback = GRID_COLS) => {
  const v = Math.round(Number(n))
  return Number.isFinite(v) ? Math.max(MIN_SPAN, Math.min(GRID_COLS, v)) : fallback
}

const clampHeight = (n: unknown): number | undefined => {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v) || v < MIN_BLOCK_H || v > MAX_BLOCK_H) return undefined
  return v
}

/**
 * Normalise a stored layout: drop unknown ids and duplicates, clamp spans and
 * heights, and append any block the teacher has never positioned so new
 * features still appear.
 *
 * Also migrates the two shapes this field had before: the `{ main, rail }`
 * column pair, and the separate top-level `heights` map.
 */
function resolvePlacements<T extends string>(
  raw: unknown,
  known: readonly T[],
  defaults: Placement<T>[],
  legacyHeights?: unknown,
): Placement<T>[] {
  const knownSet = new Set<string>(known)
  const seen = new Set<string>()
  const out: Placement<T>[] = []
  const defaultOf = (id: T) => defaults.find((p) => p.id === id)

  const heights = (legacyHeights && typeof legacyHeights === 'object' ? legacyHeights : {}) as Record<string, unknown>

  const push = (id: string, w: unknown, h: unknown) => {
    if (!knownSet.has(id) || seen.has(id)) return
    seen.add(id)
    const height = clampHeight(h ?? heights[id])
    out.push({ id: id as T, w: clampSpan(w, defaultOf(id as T)?.w ?? GRID_COLS), ...(height ? { h: height } : {}) })
  }

  if (Array.isArray(raw)) {
    for (const p of raw) {
      if (typeof p === 'string') push(p, undefined, undefined)
      else if (p && typeof p === 'object') push((p as any).id, (p as any).w, (p as any).h)
    }
  } else if (raw && typeof raw === 'object') {
    // Legacy `{ main: BlockId[], rail: BlockId[] }`. The wide column was 8 of
    // 12 and the side rail 4, so interleaving them one for one reproduces the
    // two-column layout this teacher already had: each row is 8 + 4.
    const l = raw as { main?: unknown; rail?: unknown }
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
    const main = list(l.main)
    const rail = list(l.rail)
    for (let i = 0; i < Math.max(main.length, rail.length); i++) {
      if (main[i]) push(main[i], 8, undefined)
      if (rail[i]) push(rail[i], 4, undefined)
    }
  }

  // Anything never placed keeps its default size, appended in default order.
  for (const p of defaults) if (!seen.has(p.id)) { seen.add(p.id); out.push({ ...p, ...(clampHeight(heights[p.id]) ? { h: clampHeight(heights[p.id]) } : {}) }) }

  return out
}

/**
 * Normalise a stored ladder: keep named rungs with a sane lesson count, order
 * them easiest-first, drop rungs that repeat a count, and fall back to the
 * defaults if nothing usable survives.
 */
export function resolveLevels(raw: unknown): Level[] {
  if (!Array.isArray(raw)) return DEFAULT_LEVELS
  const seen = new Set<number>()
  const out: Level[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const name = typeof (r as any).name === 'string' ? (r as any).name.trim().slice(0, 24) : ''
    const lessons = Math.round(Number((r as any).lessons))
    if (!name || !Number.isFinite(lessons) || lessons < 1 || lessons > MAX_LEVEL_LESSONS) continue
    if (seen.has(lessons)) continue
    seen.add(lessons)
    out.push({ name, lessons })
  }
  if (out.length === 0) return DEFAULT_LEVELS
  return out.sort((a, b) => a.lessons - b.lessons).slice(0, MAX_LEVELS)
}

export function resolveLayout(raw: unknown, legacyHeights?: unknown): Layout {
  return resolvePlacements(raw, DASHBOARD_BLOCKS, DEFAULT_LAYOUT, legacyHeights)
}

export function resolveLessonLayout(raw: unknown): LessonLayout {
  return resolvePlacements(raw, LESSON_BLOCKS, DEFAULT_LESSON_LAYOUT)
}

/** Darken a hex colour for hover/pressed states. */
export function shade(hex: string, amount = -0.18): string {
  if (!HEX.test(hex)) return hex
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = Math.round(c + (amount < 0 ? c * amount : (255 - c) * amount))
    return Math.max(0, Math.min(255, v))
  })
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('')
}

/**
 * CSS custom properties for a brand. Spread onto any wrapper element to
 * re-theme everything inside it — used by both the real student portal and
 * the live preview in the branding toolkit.
 */
export function brandVars(brand: Brand): React.CSSProperties {
  const r = SHAPE_RADII[brand.shape] ?? SHAPE_RADII.rounded
  const f = FONTS.find((x) => x.value === brand.font) ?? FONTS[0]
  return {
    ['--forest' as any]: brand.accent,
    ['--forest-deep' as any]: shade(brand.accent, -0.22),
    ['--brand' as any]: brand.accent,
    ['--brand-soft' as any]: shade(brand.accent, 0.88),
    ['--r-md' as any]: r.md,
    ['--r-lg' as any]: r.lg,
    ['--r-xl' as any]: r.xl,
    ['--font-head' as any]: `${f.head}, ${FONT_STACK}`,
    ['--font-body' as any]: `${f.body}, ${FONT_STACK}`,
    // Consumed by the .k-bg-* background rules.
    ['--bg-ink' as any]: shade(brand.accent, 0.72),
    ['--bg-tint' as any]: shade(brand.accent, 0.93),
  }
}

/** Class that paints the page background for a brand. */
export function backgroundClass(brand: Brand): string {
  return `k-bg-${brand.background}`
}

/** Inline width for a block spanning `w` of 12 columns in a wrapping row. */
export function spanStyle(w: number): React.CSSProperties {
  return { ['--w' as any]: clampSpan(w) }
}
