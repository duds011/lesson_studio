'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, completeOnboarding } from '@/app/actions/onboarding'
import { ACCENT_PRESETS, type Brand } from '@/lib/brand'

type Props = {
  initial: {
    fullName: string
    teachingLanguage: string | null
    timezone: string
    meetingPlatform: 'google_meet' | 'zoom'
    step: number
    brand: Brand
  }
  googleConnected: boolean
  zoomConnected: boolean
}

const LANGUAGES = ['Japanese', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Korean', 'Mandarin', 'Arabic']

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
  const [language, setLanguage] = useState(initial.teachingLanguage ?? '')
  const [customLanguage, setCustomLanguage] = useState(
    initial.teachingLanguage && !LANGUAGES.includes(initial.teachingLanguage) ? initial.teachingLanguage : ''
  )
  const [timezone, setTimezone] = useState(initial.timezone)
  const [platform, setPlatform] = useState(initial.meetingPlatform)
  const [accent, setAccent] = useState(initial.brand.accent)
  const [portalName, setPortalName] = useState(initial.brand.portalName)

  const effectiveLanguage = customLanguage.trim() || language

  const persist = (patch: Parameters<typeof saveOnboarding>[0], then?: () => void) =>
    startTransition(async () => {
      setError('')
      const res = await saveOnboarding(patch)
      if (!res.success) { setError(res.error || 'Could not save'); return }
      then?.()
    })

  const next = () => {
    if (step === 0) {
      if (!effectiveLanguage) { setError('Pick the language you teach, or type your own.'); return }
      persist({ teachingLanguage: effectiveLanguage, timezone, step: 1 }, () => setStep(1))
    } else if (step === 1) {
      persist({ meetingPlatform: platform, step: 2 }, () => setStep(2))
    } else if (step === 2) {
      persist({ step: 3 }, () => setStep(3))
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

              <div className="k-choices" style={{ marginBottom: 16 }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`k-choice ${language === l && !customLanguage ? 'sel' : ''}`}
                    onClick={() => { setLanguage(l); setCustomLanguage('') }}
                  >
                    <span className="k-choice-tick" aria-hidden>✓</span>
                    <span>{l}</span>
                  </button>
                ))}
              </div>

              <label className="k-field">
                <span>Something else</span>
                <input
                  value={customLanguage}
                  onChange={(e) => { setCustomLanguage(e.target.value); if (e.target.value) setLanguage('') }}
                  placeholder="e.g. Swedish"
                />
              </label>

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
              <p className="k-onb-lead">We&rsquo;ll create meeting links here when a student books, and send the recorder to the right place.</p>

              <div className="k-choices">
                <button type="button" className={`k-choice ${platform === 'google_meet' ? 'sel' : ''}`} onClick={() => setPlatform('google_meet')}>
                  <span className="k-choice-tick" aria-hidden>✓</span>
                  <span>Google Meet<small>Created on your calendar automatically</small></span>
                </button>
                <button type="button" className={`k-choice ${platform === 'zoom' ? 'sel' : ''}`} onClick={() => setPlatform('zoom')}>
                  <span className="k-choice-tick" aria-hidden>✓</span>
                  <span>Zoom<small>{zoomConnected ? 'Connected' : 'Connect Zoom later in Settings'}</small></span>
                </button>
              </div>
            </>
          )}

          {/* ── 3. Calendar ── */}
          {step === 2 && (
            <>
              <h1>Connect your calendar</h1>
              <p className="k-onb-lead">
                Lesson Studio reads your lessons, takes bookings into free slots, and sends the recorder to each class.
                Nothing is written to your calendar until a student books.
              </p>

              {googleConnected ? (
                <div className="k-onb-ok">
                  <span aria-hidden>✓</span>
                  <div>
                    <strong>Google Calendar connected</strong>
                    <small>You can pick which calendar holds your lessons in Settings.</small>
                  </div>
                </div>
              ) : (
                <>
                  <a className="k-btn-block" href="/api/google/auth" style={{ textDecoration: 'none' }}>
                    Connect Google Calendar
                  </a>
                  <p className="k-fine" style={{ textAlign: 'left', marginTop: 12 }}>
                    You&rsquo;ll be sent to Google&rsquo;s consent screen and returned here. You can skip this and connect later,
                    but bookings and recording stay off until you do.
                  </p>
                </>
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
            {step === 2 && !googleConnected && (
              <button type="button" className="btn btn-ghost" onClick={next} disabled={pending}>Skip for now</button>
            )}
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
