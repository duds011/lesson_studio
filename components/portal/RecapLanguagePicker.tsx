'use client'

import { useT } from '@/components/I18nProvider'
import { fill } from '@/lib/i18n'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setMyRecapLanguage } from '@/app/actions/student-prefs'
import { TEACHING_LANGUAGES } from '@/lib/languages'

/**
 * "My recaps are written in …", on the student's own page.
 *
 * A select rather than the teacher's free-text input: the teacher is trusted
 * to type a language the prompts can handle, a student has no way of knowing
 * which those are, and a typo would come back as a recap in nothing at all.
 *
 * It says what it does NOT change, because that is the question everyone asks
 * on seeing it: the French stays French. Only the explanations around it move.
 */
export default function RecapLanguagePicker({
  value,
  learning,
}: {
  value: string | null
  learning: string | null
}) {
  const t = useT()
  const router = useRouter()
  const current = value?.trim() || 'English'
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function change(next: string) {
    if (next === current) return
    setBusy(true)
    setError('')
    const res = await setMyRecapLanguage(next)
    setBusy(false)
    if (!res.success) {
      setError(res.error || t.recapLanguage.didNotSave)
      return
    }
    setSaved(next)
    router.refresh()
  }

  const target = learning?.trim()

  return (
    <div className="k-langpick">
      <div>
        <p className="k-langpick-q">{t.recapLanguage.question}</p>
        <p className="k-langpick-sub">
          {target
            ? `The ${target} you are learning stays ${target} — this is the language everything around it is explained in.`
            : t.recapLanguage.hint}
        </p>
      </div>

      <div className="k-langpick-act">
        <select
          className="k-langpick-select"
          value={current}
          disabled={busy}
          onChange={(e) => change(e.target.value)}
          aria-label={t.recapLanguage.aria}
        >
          {/* A language the teacher typed that is not on the list would vanish
              from a plain select and silently reset on the next change. */}
          {!TEACHING_LANGUAGES.some((l) => l.toLowerCase() === current.toLowerCase()) && (
            <option value={current}>{current}</option>
          )}
          {TEACHING_LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {busy && <span className="k-langpick-note">{t.common.saving}</span>}
        {!busy && saved && (
          <span className="k-langpick-note">{t.recapLanguage.saved}</span>
        )}
        {error && <span className="k-langpick-note k-langpick-note--bad">{error}</span>}
      </div>
    </div>
  )
}
