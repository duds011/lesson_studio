'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, completeOnboarding } from '@/app/actions/onboarding'
import { ACCENT_PRESETS, type Brand } from '@/lib/brand'
import {
  TEACHING_PLATFORMS, TEACHING_PLATFORM_META, isExternalPlatform, type TeachingPlatform,
} from '@/lib/teaching-platform'
import { CALENDAR_MODE_META, type CalendarMode } from '@/lib/calendar-mode'

type Props = {
  initial: {
    fullName: string
    teachingLanguage: string | null
    timezone: string
    teachingPlatform: TeachingPlatform
    /** null until they answer — this step has no safe default. */
    calendarMode: CalendarMode | null
    step: number
    brand: Brand
  }
  googleConnected: boolean
  zoomConnected: boolean
}

// The three languages the recap/test generation is tuned for. Everything else
// is off the menu until the prompts are built and tested for it.
const LANGUAGES = ['English', 'French', 'Japanese']

const ZONES = [
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai',
  'Europe/London', 'Europe/Lisbon', 'Europe/Madrid', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Australia/Sydney',
]

const STEPS = ['What you teach', 'Where you meet', 'Your calendar', 'Your student view'] as const

export default function OnboardingFlow({ initial, googleConnected, zoomConnected }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Resume where they left off, but never past the last step.
  const [step, setStep] = useState(Math.min(initial.step, STEPS.length - 1))
  // A language saved before the list narrowed to three gets re-picked here.
  const [language, setLanguage] = useState(
    initial.teachingLanguage && LANGUAGES.includes(initial.teachingLanguage) ? initial.teachingLanguage : ''
  )
  const [timezone, setTimezone] = useState(initial.timezone)
  const [platform, setPlatform] = useState<TeachingPlatform>(initial.teachingPlatform)
  // A calendar already connected is an answer in itself; otherwise they choose.
  const [calendarMode, setCalendarMode] = useState<CalendarMode | null>(
    googleConnected ? 'google' : initial.calendarMode
  )
  const [accent, setAccent] = useState(initial.brand.accent)
  const [portalName, setPortalName] = useState(initial.brand.portalName)

  const effectiveLanguage = language
  /** A marketplace teacher has no link for us to make and may have no calendar. */
  const external = isExternalPlatform(platform)

  const persist = (patch: Parameters<typeof saveOnboarding>[0], then?: () => void) =>
    startTransition(async () => {
      setError('')
      const res = await saveOnboarding(patch)
      if (!res.success) { setError(res.error || 'Could not save'); return }
      then?.()
    })

  const next = () => {
    if (step === 0) {
      if (!effectiveLanguage) { setError('Pick the language you teach.'); return }
      persist({ teachingLanguage: effectiveLanguage, timezone, step: 1 }, () => setStep(1))
    } else if (step === 1) {
      persist({ teachingPlatform: platform, step: 2 }, () => setStep(2))
    } else if (step === 2) {
      if (!calendarMode) { setError('Tell us whether your lessons live on a calendar.'); return }
      persist({ calendarMode, step: 3 }, () => setStep(3))
    }
  }

  const finish = () =>
    startTransition(async () => {
      setError('')
      const saved = await saveOnboarding({ brand: { accent, portalName } })
      if (!saved.success) { setError(saved.error || 'Could not save'); return }
      const done = await completeOnboarding()
      if (!done.success) { setError(done.error || 'Could not finish'); return }
      router.push('/')
      router.refresh()
    })

  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="k-onb">
      <div className="k-onb-side">
        <div className="k-onb-brandline">
          <span className="k-auth-mark" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', marginBottom: 0 }} aria-hidden>📚</span>
          <strong>Lesson Studio</strong>
        </div>

        <h2>Let&rsquo;s set up your studio.</h2>
        <p>Four quick steps and your students get a portal of their own.</p>

        <ol className="k-onb-steps">
          {STEPS.map((label, i) => (
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
          <span className="k-onb-count">Step {step + 1} of {STEPS.length}</span>

          {/* ── 1. Language ── */}
          {step === 0 && (
            <>
              <h1>What do you teach?</h1>
              <p className="k-onb-lead">This shapes the recaps, vocabulary and practice we generate for your students.</p>

              <label className="k-field">
                <span>Language</span>
                <select className="k-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="" disabled>Choose a language…</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <p className="k-onb-lead" style={{ fontSize: 12, marginTop: -4 }}>
                More languages are coming — these three are the ones our recaps and tests are tuned for today.
              </p>

              <label className="k-field">
                <span>Your timezone</span>
                <select className="k-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {ZONES.map((z) => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}
                </select>
              </label>
            </>
          )}

          {/* ── 2. Platform ── */}
          {step === 1 && (
            <>
              <h1>Where do you meet students?</h1>
              <p className="k-onb-lead">
                On Meet or Zoom we create the link when a student books. On a marketplace the lesson already has a
                room, so we leave the link alone and take it from there.
              </p>

              <div className="k-choices">
                {TEACHING_PLATFORMS.map((id) => {
                  const meta = TEACHING_PLATFORM_META[id]
                  const hint = id === 'zoom' && !zoomConnected ? 'Connect Zoom later in Settings' : meta.hint
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
                    <strong>We&rsquo;ll stay out of the lesson itself</strong>
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
              <h1>Where do your lessons live?</h1>
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
                    <strong>Google Calendar connected</strong>
                    <small>You can pick which calendar holds your lessons in Settings.</small>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <a className="k-btn-block" href="/api/google/auth" style={{ textDecoration: 'none' }}>
                    Connect Google Calendar
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
                      <strong>Record the lesson</strong>
                      <small>Whatever room you teach in, capture it and hand the recording to Lesson Studio.</small>
                    </div>
                  </div>
                  <div className="k-onb-ok" style={{ marginTop: 10 }}>
                    <span aria-hidden>2</span>
                    <div>
                      <strong>Review the recap</strong>
                      <small>It joins your review queue like any other lesson. Publish it and the student has it.</small>
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
              <h1>Make it yours</h1>
              <p className="k-onb-lead">Pick a colour and a name for the portal your students sign in to. You can fine-tune everything later.</p>

              <label className="k-field">
                <span>Student portal name</span>
                <input value={portalName} onChange={(e) => setPortalName(e.target.value)} placeholder="e.g. Sakura Japanese" maxLength={40} />
              </label>

              <span className="k-field-label">Accent colour</span>
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
                <span>{portalName || 'Lesson Studio'}</span>
                <strong>Learn today, succeed tomorrow!</strong>
              </div>
            </>
          )}

          {error && <p className="k-error">{error}</p>}

          <div className="k-onb-actions">
            {step > 0 && <button type="button" className="btn btn-ghost" onClick={back} disabled={pending}>Back</button>}
            {step < STEPS.length - 1 ? (
              <button type="button" className="k-btn-block" style={{ width: 'auto', marginLeft: 'auto' }} onClick={next} disabled={pending}>
                {pending ? 'Saving…' : 'Continue'}
              </button>
            ) : (
              <button type="button" className="k-btn-block" style={{ width: 'auto', marginLeft: 'auto' }} onClick={finish} disabled={pending}>
                {pending ? 'Finishing…' : 'Finish setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
