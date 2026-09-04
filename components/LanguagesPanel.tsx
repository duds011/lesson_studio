'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding } from '@/app/actions/onboarding'
import { SPOKEN_LANGUAGES, TEACHING_LANGUAGES, languageOptions } from '@/lib/languages'

/**
 * The teacher's two language facts, changeable after onboarding. The card
 * also spells out the whole model in one place — which language does what —
 * because "why is my recap in the wrong language" is always one of these
 * three fields, and until this card existed none of them were visible.
 */
export default function LanguagesPanel({ teachingLanguage, speakingLanguage }: {
  teachingLanguage: string | null
  speakingLanguage: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [teach, setTeach] = useState(teachingLanguage ?? '')
  const [speak, setSpeak] = useState(speakingLanguage ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const save = (patch: { teachingLanguage?: string; speakingLanguage?: string }) =>
    startTransition(async () => {
      setError(''); setSaved(false)
      const res = await saveOnboarding(patch)
      if (!res.success) { setError(res.error || 'Could not save'); return }
      setSaved(true)
      router.refresh()
    })

  return (
    <>
      <section className="k-sec" style={{ marginBottom: 18 }}>
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>🌍</span>
          <div>
            <h3>Your languages</h3>
            <p className="desc">What you teach, and what your lessons are spoken in. New students start from these.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, maxWidth: 460 }}>
          <label className="k-field">
            <span>Language you teach</span>
            <select
              className="k-input"
              value={teach}
              disabled={pending}
              onChange={(e) => { setTeach(e.target.value); save({ teachingLanguage: e.target.value }) }}
            >
              <option value="" disabled>choose…</option>
              {languageOptions(teachingLanguage).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <p className="desc" style={{ margin: '-6px 0 0', fontSize: 12 }}>
            Recaps and practice tests are built for this language. It pre-fills the &ldquo;Learning&rdquo; field when you
            add a student — each student can be switched individually on their page.
          </p>

          <label className="k-field">
            <span>Language your lessons are spoken in</span>
            <select
              className="k-input"
              value={speak}
              disabled={pending}
              onChange={(e) => { setSpeak(e.target.value); save({ speakingLanguage: e.target.value }) }}
            >
              <option value="" disabled>choose…</option>
              {SPOKEN_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <p className="desc" style={{ margin: '-6px 0 0', fontSize: 12 }}>
            Usually not the one being learned — a beginner&rsquo;s hour runs mostly in the language you share. Every
            student follows this unless you switch them on their own page, and the recorder reads it from there
            rather than asking before each lesson.
          </p>

          {(saved || error) && (
            <span style={{ fontSize: 12.5, color: error ? 'var(--red)' : 'var(--brand)', fontWeight: 600 }}>
              {error || 'Saved.'}
            </span>
          )}
        </div>
      </section>

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon b" aria-hidden>🧭</span>
          <div>
            <h3>How languages fit together</h3>
            <p className="desc">Three settings, three different jobs.</p>
          </div>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8, fontSize: 13.5, color: 'var(--ink)' }}>
          <li><strong>Each student&rsquo;s &ldquo;Learning&rdquo; language</strong> decides how their recaps and tests are generated — {TEACHING_LANGUAGES.join(', ')} are supported. Set when you add the student, changeable on their page.</li>
          <li><strong>Each student&rsquo;s &ldquo;Explained in&rdquo; language</strong> is what their recap text and test instructions are written in — English unless you change it, also on their page.</li>
          <li><strong>Each student&rsquo;s &ldquo;Spoken in lessons&rdquo; language</strong> is what the recorder&rsquo;s transcriber listens for during the hour. It follows your answer above until you change it on their page — the recorder no longer asks, because the answer does not change from one lesson to the next.</li>
        </ul>
      </section>
    </>
  )
}
