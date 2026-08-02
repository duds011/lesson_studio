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
  showMilestone: boolean
  showProgress: boolean
  showVocab: boolean
  showTests: boolean
  showSpeaking: boolean
}

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
  showMilestone: true,
  showProgress: true,
  showVocab: true,
  showTests: true,
  showSpeaking: true,
}

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
  const b = (raw && typeof raw === 'object' ? raw : {}) as Partial<Brand>
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
    showMilestone: bool(b.showMilestone, DEFAULT_BRAND.showMilestone),
    showProgress: bool(b.showProgress, DEFAULT_BRAND.showProgress),
    showVocab: bool(b.showVocab, DEFAULT_BRAND.showVocab),
    showTests: bool(b.showTests, DEFAULT_BRAND.showTests),
    showSpeaking: bool(b.showSpeaking, DEFAULT_BRAND.showSpeaking),
  }
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
  return {
    ['--forest' as any]: brand.accent,
    ['--forest-deep' as any]: shade(brand.accent, -0.22),
    ['--brand' as any]: brand.accent,
    ['--brand-soft' as any]: shade(brand.accent, 0.88),
    ['--r-md' as any]: r.md,
    ['--r-lg' as any]: r.lg,
    ['--r-xl' as any]: r.xl,
    // Consumed by the .k-bg-* background rules.
    ['--bg-ink' as any]: shade(brand.accent, 0.72),
    ['--bg-tint' as any]: shade(brand.accent, 0.93),
  }
}

/** Class that paints the page background for a brand. */
export function backgroundClass(brand: Brand): string {
  return `k-bg-${brand.background}`
}
