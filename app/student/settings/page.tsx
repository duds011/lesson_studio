import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { studentLocale } from '@/lib/i18n/server'
import LanguagePicker from '@/components/LanguagePicker'
import RecapLanguagePicker from '@/components/portal/RecapLanguagePicker'

export const dynamic = 'force-dynamic'

/**
 * The student's own settings — the portal had none at all.
 *
 * That was fine right up until the app guessed something wrong about somebody,
 * and the first thing it guessed wrong was the language. Which is the one
 * setting you cannot fix from inside an app that is already speaking to you in
 * a language you do not read. So this page exists, and the page's own language
 * is the first thing on it.
 *
 * Two languages, kept apart on purpose. They sound like one question and are
 * not: "what do I read the app in" and "what do I want my lessons explained
 * in". Someone who asked for French recaps *because* they are learning French
 * should not have lost their English buttons in the bargain.
 *
 * The recap picker brings its own question and its own card — it used to sit
 * at the foot of the dashboard, which is where a student found it by accident
 * if at all. It belongs here, beside the other language.
 */
export default async function StudentSettingsPage() {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/student/settings')

  const { data: student } = await supabase
    .from('students')
    .select('instruction_language, language')
    .eq('profile_id', user.id)
    .maybeSingle()

  // Through the resolver rather than reading profiles.ui_language inline, so
  // the picker highlights the language the page actually rendered in —
  // including the recap-language guess for a student who has never chosen.
  // Highlighting an empty column would show English beside a French page.
  const locale = await studentLocale(createAdminClient(), user.id)
  const t = getDict(locale)

  return (
    <div className="k-page">
      <div>
        <Link href="/student/dashboard" className="k-back">{t.studentSettings.back}</Link>
      </div>

      <div className="k-top">
        <div>
          <p className="k-hello">{t.studentSettings.eyebrow}</p>
          <h1 className="k-name">{t.studentSettings.title}</h1>
        </div>
      </div>

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>🌍</span>
          <div>
            <h3>{t.studentSettings.languageTitle}</h3>
            <p className="desc">{t.studentSettings.languageDesc}</p>
          </div>
        </div>
        <LanguagePicker current={locale} />
      </section>

      <RecapLanguagePicker
        value={(student as any)?.instruction_language ?? null}
        learning={(student as any)?.language ?? null}
      />
    </div>
  )
}
