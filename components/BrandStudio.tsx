'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import {
  ACCENT_PRESETS, DEFAULT_BRAND, BLOCK_LABELS, BLOCK_TEXT_SLOTS, BLOCK_TOGGLE,
  DASH_BLOCK_TAB, DASH_TABS, PRESETS, FONTS, TEXT_SLOTS,
  brandVars, backgroundClass, MAX_LEVELS, MAX_LEVEL_LESSONS, resolveLevels,
  type Brand, type HeroStyle, type BackgroundStyle, type ShapeStyle, type PropStyle,
  type BlockId, type DashTab, type TextSlot,
} from '@/lib/brand'
import LessonPageTabs from './LessonPageTabs'
import { DashboardBlock, DASHBOARD_LAYOUT, blockHasContent, type DashboardData } from './portal/DashboardBlocks'

const HEX = /^#[0-9a-fA-F]{6}$/

/**
 * The canvas is a fixed page, not a fluid one: what a teacher sees has to be
 * what a student on a laptop gets. 1180 is the student portal's own content
 * width at 1280 wide, rail and padding removed. A narrow pane scales the whole
 * page down rather than reflowing it.
 */
const CANVAS_WIDTH = { desktop: 1180, mobile: 390 } as const

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
  { id: 'milestone', hint: 'Progress toward their next level' },
  { id: 'scores', hint: 'The last few lesson scores' },
  { id: 'progress', hint: 'Score, talk-time and vocabulary trends' },
  { id: 'vocab', hint: 'Words learned by level' },
  { id: 'tests', hint: 'Tests you publish to them' },
  { id: 'speaking', hint: 'Pace and thinking time' },
]

/**
 * A believable student, so the preview is the real page with the real
 * components — not an imitation of them that can fall out of date.
 */
const SAMPLE: DashboardData = {
  lessonCount: 12,
  recentCount: 3,
  scoredCount: 9,
  avgScore: 7.4,
  scoreDelta: 1.9,
  latestTalk: 41,
  talkDelta: 8,
  pillarLessons: [
    { id: 's3', number: 12, title: 'Contrasting ideas with けど', meta: '12th lesson · 2 Aug', score: 8.3, tag: 'Lesson 12' },
    { id: 's2', number: 11, title: 'Ordering at a restaurant', meta: '11th lesson · 26 Jul', score: 7.8, tag: 'Lesson 11' },
    { id: 's1', number: 10, title: 'Talking about last weekend', meta: '10th lesson · 19 Jul', score: 6.9, tag: 'Lesson 10' },
  ],
  progressLessons: [
    { lessonNumber: 12, score: 8.3, talkPct: 41, vocabCount: 14, wpm: 96, responseSec: 1.8 },
    { lessonNumber: 11, score: 7.8, talkPct: 38, vocabCount: 11, wpm: 92, responseSec: 2.1 },
    { lessonNumber: 10, score: 6.9, talkPct: 35, vocabCount: 9, wpm: 88, responseSec: 2.4 },
    { lessonNumber: 9, score: 7.1, talkPct: 33, vocabCount: 12, wpm: 84, responseSec: 2.9 },
    { lessonNumber: 8, score: 6.4, talkPct: 30, vocabCount: 8, wpm: 79, responseSec: 3.3 },
  ],
  vocabDistribution: { N5: 18, N4: 13, N3: 9, N2: 5 },
  totalVocab: 45,
  scoreTrend: [
    { lesson: 8, score: 6.4 }, { lesson: 9, score: 7.1 }, { lesson: 10, score: 6.9 },
    { lesson: 11, score: 7.8 }, { lesson: 12, score: 8.3 },
  ],
  tests: [
    { id: 't1', title: 'Particles — quick check', lessonNumber: 12, date: '2 Aug' },
    { id: 't2', title: 'Restaurant phrases', lessonNumber: 11, date: '26 Jul' },
  ],
  avgWpm: 54,
  avgThinkSec: 2.4,
}

/** A stand-in recap, so the recap preview is the real LessonPageTabs too. */
const SAMPLE_RECAP = {
  talk_percentage: 41,
  score: 8.3,
  level: 'Confident',
  vocab_level_distribution: { N5: 8, N4: 5, N3: 3 },
  metrics: { studentWpm: 96, teacherWpm: 118, avgResponseSec: 1.8, grammarPer100: 4.2 },
  sections: [
    { title: 'What you worked on', body: 'Contrasting two ideas in one sentence, and softening a disagreement.' },
    { title: 'Main corrections', body: 'けど joins two clauses — it does not start one.' },
  ],
  homework: 'Write five sentences contrasting something you like with something you do not.',
  teacher_note: 'Much more confident this week — you corrected yourself twice without help.',
  vocabulary: [
    { word: 'けど', reading: 'kedo', definition: 'but, although', jlpt_level: 'N5' },
    { word: '静か', reading: 'shizuka', definition: 'quiet', jlpt_level: 'N5' },
  ],
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

/**
 * The branding studio.
 *
 * It used to be a layout editor: drag blocks around, pull their edges, type
 * onto the canvas. That bought a handful of arrangements nobody asked for and a
 * long tail of ways to end up with a broken page — and because the canvas drew
 * its own imitation of the portal, what a teacher designed was never quite what
 * their student opened.
 *
 * So: the arrangement is ours, the styling is theirs, and the preview renders
 * the real components (DashboardBlocks, LessonPageTabs) from the real brand.
 * If a block changes, the preview changes with it; there is nothing left to
 * keep in step by hand.
 */
export default function BrandStudio({ initial, teacherName }: { initial: Brand; teacherName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [brand, setBrand] = useState<Brand>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard')
  const [dashTab, setDashTab] = useState<DashTab>('Overview')
  /** One tool open at a time — the menu is a stack of drawers, not a page. */
  const [tool, setTool] = useState<string | null>('presets')
  /** Which block's options are unfolded under its switch. */
  const [openOptions, setOpenOptions] = useState<string | null>(null)

  const canvasEl = useRef<HTMLDivElement | null>(null)
  const frameEl = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  // Fit the fixed-width canvas into whatever pane it has, and keep the space it
  // occupies in the layout equal to its scaled height.
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
  }, [device, view, dashTab, brand])

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

  // ── milestone ladder ────────────────────────────────────────────────────
  const patchLevel = (i: number, patch: Partial<{ name: string; lessons: number }>) =>
    set('levels', brand.levels.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const settleLevels = () => set('levels', resolveLevels(brand.levels))
  const addLevel = () => {
    const last = brand.levels[brand.levels.length - 1]
    set('levels', [...brand.levels, { name: 'New level', lessons: Math.min(MAX_LEVEL_LESSONS, (last?.lessons ?? 0) + 10) }])
  }
  const removeLevel = (i: number) => set('levels', brand.levels.filter((_, idx) => idx !== i))

  const vars = brandVars(brand)
  const L = brand.labels

  const activePreset = PRESETS.find(
    (p) => p.brand.accent.toLowerCase() === brand.accent.toLowerCase()
      && p.brand.font === brand.font && p.brand.shape === brand.shape && p.brand.background === brand.background,
  )

  /** The blocks this tab shows, exactly as the student's page decides it. */
  const tabBlocks = DASHBOARD_LAYOUT.filter(
    ({ id }) => DASH_BLOCK_TAB[id] === dashTab && blockHasContent(id, brand, SAMPLE),
  )

  return (
    <div className="k-studio">
      {/* ── controls ── */}
      <div className="k-studio-controls">
        <Tool id="presets" icon="✨" tone="" title="Presets" desc="A complete look — colour, type and texture in one go." openId={tool} onOpen={setTool}>
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
              placeholder="#0a61c9"
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

        <Tool id="words" icon="✍️" tone="y" title="Words" desc="The hero lines, the portal name, and what each section is called." openId={tool} onOpen={setTool}>
          <label className="k-field">
            <span>Portal name</span>
            <input value={brand.portalName} onChange={(e) => set('portalName', e.target.value)} maxLength={40} placeholder="Lesson Studio" />
          </label>

          <label className="k-field">
            <span>Mark <small style={{ fontWeight: 500 }}>(emoji or initials)</small></span>
            <input value={brand.logoText} onChange={(e) => set('logoText', e.target.value)} maxLength={4} placeholder="📚" />
          </label>

          <label className="k-field">
            <span>Greeting</span>
            <input
              value={L.greeting}
              onChange={(e) => set('labels', { ...L, greeting: e.target.value.slice(0, 40) })}
              onBlur={(e) => { if (!e.target.value.trim()) set('labels', { ...L, greeting: TEXT_SLOTS.greeting }) }}
              placeholder={TEXT_SLOTS.greeting}
            />
          </label>

          <label className="k-field">
            <span>Hero headline</span>
            <textarea className="k-input" rows={2} value={brand.headline} onChange={(e) => set('headline', e.target.value)} maxLength={90} placeholder={DEFAULT_BRAND.headline} />
          </label>

          <label className="k-field">
            <span>Hero subtext</span>
            <textarea className="k-input" rows={3} value={brand.welcome} onChange={(e) => set('welcome', e.target.value)} maxLength={200} placeholder={DEFAULT_BRAND.welcome} />
          </label>

          <span className="k-field-label">Tab names</span>
          {(['tabOverview', 'tabLessons', 'tabProgress'] as TextSlot[]).map((slot) => (
            <label className="k-field" key={slot}>
              <span>{TEXT_SLOTS[slot]}</span>
              <input
                value={L[slot]}
                onChange={(e) => set('labels', { ...L, [slot]: e.target.value.slice(0, 40) })}
                onBlur={(e) => { if (!e.target.value.trim()) set('labels', { ...L, [slot]: TEXT_SLOTS[slot] }) }}
                placeholder={TEXT_SLOTS[slot]}
              />
            </label>
          ))}
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

        <Tool id="sections" icon="🧩" tone="p" title="Sections" desc="Switch off anything that doesn't fit how you teach — it leaves the preview and the student's page together." openId={tool} onOpen={setTool}>
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
                      <button type="button" className="k-opt-btn" aria-expanded={unfolded} onClick={() => setOpenOptions(unfolded ? null : t.id)}>
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
                            value={L[slot]}
                            onChange={(e) => set('labels', { ...L, [slot]: e.target.value.slice(0, 40) })}
                            onBlur={(e) => { if (!e.target.value.trim()) set('labels', { ...L, [slot]: TEXT_SLOTS[slot] }) }}
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

      {/* ── the real portal, at the real widths ── */}
      <div className="k-studio-preview">
        <div className="k-preview-bar">
          <span className="k-preview-label">
            {view === 'dashboard' ? 'Student dashboard' : 'Lesson recap'} · exactly what your students see
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
                <div className="k-top">
                  <div>
                    <p className="k-hello">{L.greeting}</p>
                    <h1 className="k-name">Derek</h1>
                  </div>
                  <div className="k-top-tools">
                    <div className="k-whoami">
                      <span className="k-whoami-mark" aria-hidden>{brand.logoText}</span>
                      <span className="k-whoami-name">{brand.portalName}</span>
                    </div>
                  </div>
                </div>

                <div className="k-dtabs">
                  {DASH_TABS.map((t) => (
                    <button key={t} type="button" className={dashTab === t ? 'on' : ''} onClick={() => setDashTab(t)}>
                      {L[`tab${t}` as 'tabOverview' | 'tabLessons' | 'tabProgress']}
                    </button>
                  ))}
                </div>

                <div className={`k-flow ${device === 'mobile' ? 'narrow' : ''}`} key={`${dashTab}-${device}`}>
                  {tabBlocks.map(({ id, w }) => (
                    <div key={id} style={{ ['--w' as any]: w }}>
                      <DashboardBlock id={id} brand={brand} data={SAMPLE} preview />
                    </div>
                  ))}
                  {tabBlocks.length === 0 && <div className="k-flow-empty">Every section on this tab is switched off</div>}
                </div>
              </>
            ) : (
              <div className="k-lpview">
                <span className="k-back">← Dashboard</span>
                <LessonPageTabs
                  lesson={{ id: 'preview', lessonNumber: 12, date: '2 Aug', title: 'Contrasting ideas with けど', recap: SAMPLE_RECAP }}
                  studentFirst="Derek"
                  teacherFirst={teacherName || 'Your teacher'}
                  brand={brand}
                />
              </div>
            )}
          </div>
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          This is the student portal itself, rendered with your styling — not a mock-up of it. Choose a colour, a
          typeface, a texture and what each section is called; switch off anything you don&rsquo;t teach with. The
          arrangement is fixed so it stays readable on a phone.
          {' '}Save to publish it to {teacherName ? `${teacherName}'s` : 'your'} students.
        </p>
      </div>
    </div>
  )
}
