'use client'

import { useT } from '@/components/I18nProvider'
import { fill, rich } from '@/lib/i18n'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, completeOnboarding } from '@/app/actions/onboarding'
import { RECORDER_STORE_URL } from '@/lib/recorder'
import { ACCENT_PRESETS, type Brand } from '@/lib/brand'
import {
  TEACHING_PLATFORMS, TEACHING_PLATFORM_META, isExternalPlatform, type TeachingPlatform,
} from '@/lib/teaching-platform'
import { CALENDAR_MODE_META, type CalendarMode } from '@/lib/calendar-mode'
import { SPOKEN_LANGUAGES, TEACHING_LANGUAGES } from '@/lib/languages'

type Props = {
  initial: {
    fullName: string
    teachingLanguage: string | null
    /** What they explain in. Null until they have been through this step. */
    speakingLanguage: string | null
    timezone: string
    teachingPlatform: TeachingPlatform
    /** null until they answer — this step has no safe default. */
    calendarMode: CalendarMode | null
    step: number
    brand: Brand
    /**
     * The portal name as STORED, empty when they have never answered.
     * `brand` is resolved and therefore always carries a name, which is the
     * whole problem this separates out.
     */
    portalNameSet: string
  }
  googleConnected: boolean
  zoomConnected: boolean
}

const ZONES = [
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai',
  'Europe/London', 'Europe/Lisbon', 'Europe/Madrid', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Australia/Sydney',
]

/**
 * Only the COUNT and the order live here now; the words come from the
 * dictionary. The step machine indexes by number, so the two arrays have to
 * stay the same length — the shape check on the translations enforces that.
 */
const STEP_COUNT = 5

export default function OnboardingFlow({ initial, googleConnected, zoomConnected }: Props) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Resume where they left off, but never past the last step.
  const [step, setStep] = useState(Math.min(initial.step, STEP_COUNT - 1))
  const [teachingLanguage, setTeachingLanguage] = useState(initial.teachingLanguage ?? '')
  const [spokenLanguage, setSpokenLanguage] = useState(initial.speakingLanguage ?? '')
  const [timezone, setTimezone] = useState(initial.timezone)
  const [platform, setPlatform] = useState<TeachingPlatform>(initial.teachingPlatform)
  // A calendar already connected is an answer in itself; otherwise they choose.
  const [calendarMode, setCalendarMode] = useState<CalendarMode | null>(
    googleConnected ? 'google' : initial.calendarMode
  )
  const [accent, setAccent] = useState(initial.brand.accent)
  // Empty until they answer, for the same reason calendarMode is: this field
  // used to open pre-filled with the resolved default, so it read as already
  // answered, the placeholder could never show, and every teacher through it
  // ended up called "Lesson Studio" in their students' portal.
  const [portalName, setPortalName] = useState(initial.portalNameSet)

  /** A marketplace teacher has no link for us to make and may have no calendar. */
  const external = isExternalPlatform(platform)

  const persist = (patch: Parameters<typeof saveOnboarding>[0], then?: () => void) =>
    startTransition(async () => {
      setError('')
      const res = await saveOnboarding(patch)
      if (!res.success) { setError(res.error || t.onboarding.couldNotSave); return }
      then?.()
    })

  const next = () => {
    if (step === 0) {
      if (!teachingLanguage) { setError(t.onboarding.pickTeaching); return }
      if (!spokenLanguage) { setError(t.onboarding.pickSpoken); return }
      persist({ teachingLanguage, speakingLanguage: spokenLanguage, timezone, step: 1 }, () => setStep(1))
    } else if (step === 1) {
      persist({ teachingPlatform: platform, step: 2 }, () => setStep(2))
    } else if (step === 2) {
      if (!calendarMode) { setError(t.onboarding.pickCalendar); return }
      persist({ calendarMode, step: 3 }, () => setStep(3))
    } else if (step === 3) {
      if (!portalName.trim()) { setError(t.onboarding.pickPortalName); return }
      // The look is saved on the way past, so the recorder step is the only
      // thing between here and finishing.
      persist({ brand: { accent, portalName: portalName.trim() }, step: 4 }, () => setStep(4))
    }
  }

  const finish = () =>
    startTransition(async () => {
      setError('')
      const saved = await saveOnboarding({ brand: { accent, portalName: portalName.trim() } })
      if (!saved.success) { setError(saved.error || t.onboarding.couldNotSave); return }
      const done = await completeOnboarding()
      if (!done.success) { setError(done.error || t.onboarding.couldNotFinish); return }
      router.push('/')
      router.refresh()
    })

  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="k-onb">
      <div className="k-onb-side">
        <div className="k-onb-brandline">
          <span className="k-auth-mark" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', marginBottom: 0 }} aria-hidden>📚</span>
          <strong>{t.nav.appName}</strong>
        </div>

        <h2>{t.onboarding.sideTitle}</h2>
        <p>{t.onboarding.sideBody}</p>

        <ol className="k-onb-steps">
          {t.onboarding.steps.map((label, i) => (
            <li key={label} className={i === step ? 'now' : i < step ? 'done' : ''}>
              <span className="k-onb-dot">{i < step ? '✓' : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <div className="k-hero-art" style={{ bottom: 24, top: 'auto', right: -20, opacity: .5 }} aria-hidden>
          <span className="k-orb" style={{ width: 92, height: 92, right: 30, top: 20 }} />
          <span className="k-tube" style={{ width: 70, height: 70, right: 96, top: 78, transform: 'rotate(30deg)' }} />
        </div>
      </div>

      <div className="k-onb-main">
        <div className="k-onb-card">
          <span className="k-onb-count">{fill(t.onboarding.stepCount, { n: step + 1, total: STEP_COUNT })}</span>

          {/* ── 1. Language ── */}
          {step === 0 && (
            <>
              {/* Two sentences, two different facts. What each student is
                  LEARNING is asked when that student is added, where it
                  belongs — these keep only the per-teacher facts, worn as
                  plain words. */}
              <div className="k-onb-sentence" aria-label={t.onboarding.teachAria}>
                <span>{t.onboarding.iTeach}</span>
                <select
                  value={teachingLanguage}
                  onChange={(e) => setTeachingLanguage(e.target.value)}
                >
                  <option value="" disabled>choose…</option>
                  {TEACHING_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <p className="k-onb-lead" style={{ fontSize: 12.5 }}>
                Recaps and practice tests are built for this language. It&rsquo;s the default for every student you add —
                each student can be switched individually later.
              </p>

              <div className="k-onb-sentence" aria-label={t.onboarding.spokenAria}>
                <span>{t.onboarding.spokenIn}</span>
                <select
                  value={spokenLanguage}
                  onChange={(e) => setSpokenLanguage(e.target.value)}
                >
                  <option value="" disabled>choose…</option>
                  {SPOKEN_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <p className="k-onb-lead" style={{ fontSize: 12.5 }}>
                Often not the language being learned — a beginner&rsquo;s hour runs mostly in the language you share.
                It&rsquo;s what the recorder listens for.
              </p>

              <label className="k-field">
                <span>{t.onboarding.timezone}</span>
                <select className="k-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {ZONES.map((z) => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}
                </select>
              </label>
            </>
          )}

          {/* ── 2. Platform ── */}
          {step === 1 && (
            <>
              <h1>{t.onboarding.platformTitle}</h1>
              <p className="k-onb-lead">
                On Meet or Zoom we create the link when a student books. On a marketplace the lesson already has a
                room, so we leave the link alone and take it from there.
              </p>

              <div className="k-choices">
                {TEACHING_PLATFORMS.map((id) => {
                  const meta = TEACHING_PLATFORM_META[id]
                  const hint = id === 'zoom' && !zoomConnected ? t.onboarding.zoomLater : meta.hint
                  return (
                    <button key={id} type="button" className={`k-choice ${platform === id ? 'sel' : ''}`} onClick={() => setPlatform(id)}>
                      <span className="k-choice-tick" aria-hidden>✓</span>
                      <span>{meta.label}<small>{hint}</small></span>
                    </button>
                  )
                })}
              </div>

              {external && (
                <div className="k-onb-ok" style={{ marginTop: 16, background: 'var(--amber-soft)' }}>
                  <span aria-hidden style={{ background: 'var(--amber)' }}>i</span>
                  <div>
                    <strong>{t.onboarding.stayOutTitle}</strong>
                    <small>
                      No links created, no bot sent. You record the lesson yourself and the recap, vocabulary and
                      practice are built from that — everything your students see works the same.
                    </small>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── 3. Calendar — the fork the whole workspace follows ── */}
          {step === 2 && (
            <>
              <h1>{t.onboarding.calendarTitle}</h1>
              <p className="k-onb-lead">
                {external
                  ? `Some ${TEACHING_PLATFORM_META[platform].label} teachers still keep their week on Google Calendar, and some never leave the platform. Your answer decides what the workspace shows you.`
                  : 'If your students are on your Google Calendar we can read the week, take bookings and send the recorder. If you schedule elsewhere, we stay out of it.'}
              </p>

              <div className="k-choices">
                {(['google', 'none'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`k-choice ${calendarMode === id ? 'sel' : ''}`}
                    onClick={() => { setCalendarMode(id); setError('') }}
                    aria-pressed={calendarMode === id}
                  >
                    <span className="k-choice-tick" aria-hidden>✓</span>
                    <span>{CALENDAR_MODE_META[id].label}<small>{CALENDAR_MODE_META[id].hint}</small></span>
                  </button>
                ))}
              </div>

              {/* What that answer means, shown in place rather than a step later. */}
              {calendarMode === 'google' && (googleConnected ? (
                <div className="k-onb-ok" style={{ marginTop: 16 }}>
                  <span aria-hidden>✓</span>
                  <div>
                    <strong>{t.onboarding.googleConnected}</strong>
                    <small>{t.onboarding.googleConnectedSub}</small>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <a className="k-btn-block" href="/api/google/auth" style={{ textDecoration: 'none' }}>
                    {t.onboarding.connectGoogle}
                  </a>
                  <p className="k-fine" style={{ textAlign: 'left', marginTop: 12 }}>
                    You&rsquo;ll be sent to Google&rsquo;s consent screen and returned here. You can carry on without it,
                    but bookings and automatic recording stay off until you connect.
                  </p>
                </div>
              ))}

              {calendarMode === 'none' && (
                <div style={{ marginTop: 16 }}>
                  <div className="k-onb-ok">
                    <span aria-hidden>1</span>
                    <div>
                      <strong>{t.onboarding.recordTitle}</strong>
                      <small>{t.onboarding.recordBody}</small>
                    </div>
                  </div>
                  <div className="k-onb-ok" style={{ marginTop: 10 }}>
                    <span aria-hidden>2</span>
                    <div>
                      <strong>{t.onboarding.reviewTitle}</strong>
                      <small>{t.onboarding.reviewBody}</small>
                    </div>
                  </div>
                  <p className="k-fine" style={{ textAlign: 'left', marginTop: 14 }}>
                    No calendar, no booking page, no nagging — your workspace opens on lessons and recaps instead.
                    Change your mind any time in Settings.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── 4. Brand ── */}
          {step === 3 && (
            <>
              <h1>{t.onboarding.brandTitle}</h1>
              <p className="k-onb-lead">{t.onboarding.brandLead}</p>

              <label className="k-field">
                <span>{t.onboarding.portalNameLabel}</span>
                <input
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  placeholder={t.onboarding.portalNamePlaceholder}
                  maxLength={40}
                  autoFocus
                />
                <small className="k-fine" style={{ textAlign: 'left', marginTop: 6 }}>
                  This is the name across the top of every student&rsquo;s portal, and on the invite they
                  open. Your own studio name, not ours.
                </small>
              </label>

              <span className="k-field-label">{t.onboarding.accent}</span>
              <div className="k-swatches">
                {ACCENT_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    title={p.name}
                    aria-label={p.name}
                    className={`k-swatch ${accent.toLowerCase() === p.value.toLowerCase() ? 'sel' : ''}`}
                    style={{ background: p.value }}
                    onClick={() => setAccent(p.value)}
                  />
                ))}
              </div>

              <div className="k-onb-preview" style={{ background: accent }}>
                <span>{portalName || t.nav.appName}</span>
                <strong>{t.onboarding.previewTagline}</strong>
              </div>
            </>
          )}

          {/* ── 5. The recorder ── */}
          {step === 4 && (
            <>
              <h1>{t.onboarding.recorderTitle}</h1>
              <p className="k-onb-lead">
                This is the part that does the work: a Chrome extension that records your lesson
                and writes the recap. No bot joins the call, and nothing is installed on your
                student&rsquo;s side.
              </p>

              <ol className="k-onb-list">
                <li><strong>Add it from the Chrome Web Store</strong> — one click, then pin it to your toolbar.</li>
                <li><strong>Sign in inside the extension</strong> with this same email and password. There is nothing to copy across.</li>
                <li><strong>Record a lesson</strong>: pick the student, hit start, hit stop at the end.</li>
              </ol>

              <a
                href={RECORDER_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="k-onb-cta"
              >
                {t.onboarding.addToChrome}
              </a>

              <p className="k-onb-fine">
                {rich(t.onboarding.recorderFine, {
                  guide: (
                    <a href="/recorder" target="_blank" rel="noopener">
                      {t.onboarding.recorderFineLink}
                    </a>
                  ),
                })}
              </p>
            </>
          )}

          {error && <p className="k-error">{error}</p>}

          <div className="k-onb-actions">
            {step > 0 && <button type="button" className="btn btn-ghost" onClick={back} disabled={pending}>{t.common.back}</button>}
            {step < STEP_COUNT - 1 ? (
              <button type="button" className="k-btn-block" style={{ width: 'auto', marginLeft: 'auto' }} onClick={next} disabled={pending}>
                {pending ? t.common.saving : t.onboarding.continueAction}
              </button>
            ) : (
              <button type="button" className="k-btn-block" style={{ width: 'auto', marginLeft: 'auto' }} onClick={finish} disabled={pending}>
                {pending ? t.onboarding.finishing : t.onboarding.finish}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
