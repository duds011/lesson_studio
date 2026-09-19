import { getToken } from '@/lib/store'
import { listCalendars, type CalendarInfo } from '@/lib/google'
import { getSettings } from '@/lib/settings'
import { getBookingConfig } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import { CALENDAR_MODES, CALENDAR_MODE_META, resolveCalendarMode } from '@/lib/calendar-mode'
import { chooseCalendarMode } from '@/app/actions/calendar'
import { chooseSpeakingSubmissions } from '@/app/actions/portal-settings'
import { chooseAutoPublish } from '@/app/actions/auto-publish'
import AppNav from '@/components/AppNav'
import ConnectorsGallery from '@/components/ConnectorsGallery'
import SettingsTabs, { SettingsPanel } from '@/components/SettingsTabs'
import ChoiceGroup from '@/components/ChoiceGroup'
import LanguagesPanel from '@/components/LanguagesPanel'
import ExtTokenPanel from '@/components/ExtTokenPanel'
import ReplayTourButton from '@/components/ReplayTourButton'
import LanguagePicker from '@/components/LanguagePicker'
import { teacherLocale } from '@/lib/i18n/server'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'
import { getDict, rich } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const token = await getToken()
  const settings = await getSettings()
  const bookingConfig = await getBookingConfig()

  let calendars: CalendarInfo[] = []
  let needsReconnect = false
  if (token) {
    try {
      calendars = await listCalendars()
    } catch (e: any) {
      if (e?.message === 'SCOPE') needsReconnect = true
    }
  }
  const selectedId = token?.calendarId || 'primary'

  // Connector statuses for the gallery.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('auto_publish_recaps, calendar_mode, plan_id, stripe_customer_id, teaching_language, speaking_language, speaking_submissions').eq('id', user.id).single()
    : { data: null }
  // Through the resolver rather than reading profile.ui_language inline, so
  // the picker highlights what the layout actually rendered in — including
  // the Accept-Language guess for a teacher who has never chosen.
  const uiLocale = user ? await teacherLocale(supabase, user.id) : DEFAULT_LOCALE
  const t = getDict(uiLocale)
  const calendarMode = resolveCalendarMode((profile as any)?.calendar_mode)
  // Unset is on: every recap already writes the exercises, and a teacher who
  // would rather not be sent audio says so here.
  const speakingOn = (profile as any)?.speaking_submissions !== false
  // Reviewing is the default: anything other than an explicit true reviews.
  const autoPublish = (profile as any)?.auto_publish_recaps === true
  // The teacher's own recorder token, read with their own client so RLS
  // confirms it is theirs rather than the page taking the id on trust.
  const { data: extToken } = user
    ? await supabase.from('teacher_ext_tokens').select('token, last_used_at').eq('teacher_id', user.id).maybeSingle()
    : { data: null }

  return (
    <>
      <AppNav email={token?.email} connected={Boolean(token)} calendar={calendarMode !== 'none'} />
      <main className="wrap settings-wrap page-fade">
        <header className="k-thead slim">
          <div className="k-thead-title">
            <span className="k-phead-eyebrow">{t.settings.eyebrow}</span>
            <h1>{t.settings.title}</h1>
          </div>
          <div className="k-hero-art" style={{ right: -20, opacity: .4 }} aria-hidden>
            <span className="k-orb" style={{ width: 64, height: 64, right: 14, top: -6 }} />
            <span className="k-ring" style={{ width: 36, height: 36, right: 80, top: 44 }} />
          </div>
        </header>

        <SettingsTabs>
          {/* ── Connections ─────────────────────────────────────────── */}
          <SettingsPanel id="connections">
            <section className="k-sec" style={{ marginBottom: 18 }}>
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>🎙️</span>
                <div>
                  <h3>{t.settings.recorderTitle}</h3>
                  <p className="desc">
                    {rich(t.settings.recorderDesc, {
                      guide: (
                        <a href="/recorder" style={{ color: 'var(--brand)', fontWeight: 700 }}>
                          {t.settings.recorderGuide}
                        </a>
                      ),
                    })}
                  </p>
                </div>
              </div>
              <ExtTokenPanel
                token={(extToken as any)?.token ?? null}
                lastUsedAt={(extToken as any)?.last_used_at ?? null}
              />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ReplayTourButton />
                <span className="desc" style={{ fontSize: 12 }}>{t.settings.replayTourHint}</span>
              </div>
            </section>

            {/* Above Connections on purpose: someone who has landed in a
                language they cannot read needs this before anything else on
                the page, and the endonyms make it findable without reading
                the heading. */}
            <section className="k-sec" style={{ marginBottom: 18 }}>
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>🌍</span>
                <div>
                  <h3>{t.settings.languageTitle}</h3>
                  <p className="desc">{t.settings.languageDesc}</p>
                </div>
              </div>
              <LanguagePicker current={uiLocale} />
            </section>

            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>🔗</span>
                <div>
                  <h3>{t.settings.connectionsTitle}</h3>
                  <p className="desc">{t.settings.connectionsDesc}</p>
                </div>
              </div>
              <ConnectorsGallery
                t={t}
                google={{ connected: Boolean(token), needsReconnect, email: token?.email }}
              />
            </section>

            {/* The onboarding answer, changeable — see lib/calendar-mode. */}
            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon y" aria-hidden>🗓️</span>
                <div>
                  <h3>{t.settings.livesTitle}</h3>
                  <p className="desc">{t.settings.livesDesc}</p>
                </div>
              </div>
              <ChoiceGroup
                name="mode"
                value={calendarMode}
                action={chooseCalendarMode}
                options={CALENDAR_MODES.map((m) => ({
                  value: m,
                  label: CALENDAR_MODE_META[m].label,
                  hint: CALENDAR_MODE_META[m].hint,
                }))}
              />
            </section>

            {/* Which calendar holds lessons (only when Google is connected) */}
            {token && !needsReconnect && calendars.length > 0 && (
              <section className="k-sec">
                <div className="k-sec-head">
                  <span className="k-sec-icon y" aria-hidden>📅</span>
                  <div>
                    <h3>{t.settings.calendarTitle}</h3>
                    <p className="desc">{t.settings.calendarDesc}</p>
                  </div>
                </div>
                <div className="k-choices">
                  {calendars.map((c) => {
                    const sel = c.id === selectedId || (c.primary && selectedId === 'primary')
                    return (
                      <form key={c.id} action="/api/google/select-calendar" method="post">
                        <input type="hidden" name="calendarId" value={c.id} />
                        <input type="hidden" name="calendarName" value={c.name} />
                        <button type="submit" className={`k-choice ${sel ? 'sel' : ''}`}>
                          <span className="k-choice-tick" aria-hidden>✓</span>
                          <span>
                            {c.name}
                            {c.primary && <small>{t.settings.primaryCalendar}</small>}
                          </span>
                        </button>
                      </form>
                    )
                  })}
                </div>
              </section>
            )}
          </SettingsPanel>

          {/* ── Languages: the teacher's two facts + the model explained ── */}
          <SettingsPanel id="languages">
            <LanguagesPanel
              teachingLanguage={(profile as any)?.teaching_language ?? null}
              speakingLanguage={(profile as any)?.speaking_language ?? null}
            />
          </SettingsPanel>

          {/* The Lessons tab is gone. It held the write-up balance and the
              three packs, which are not settings — you do not come to Settings
              to buy something, and a teacher who has run out will not look for
              the shop behind a gear. Both live at /teacher/recaps now, with a
              permanent button in the sidebar. */}

          {/* ── Student portal: what the student's side is allowed to do ── */}
          <SettingsPanel id="portal">
            <section className="k-sec" style={{ marginBottom: 18 }}>
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>📨</span>
                <div>
                  <h3>{t.settings.autoSendTitle}</h3>
                  <p className="desc">{t.settings.autoSendDesc}</p>
                </div>
              </div>
              <ChoiceGroup
                name="on"
                value={autoPublish ? 'yes' : 'no'}
                action={chooseAutoPublish}
                options={[
                  { value: 'no', label: t.settings.autoSendReview, hint: t.settings.autoSendReviewHint },
                  { value: 'yes', label: t.settings.autoSendAuto, hint: t.settings.autoSendAutoHint },
                ]}
              />
            </section>

            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>🎙️</span>
                <div>
                  <h3>{t.settings.speakingTitle}</h3>
                  <p className="desc">{t.settings.speakingDesc}</p>
                </div>
              </div>
              <ChoiceGroup
                name="on"
                value={speakingOn ? 'yes' : 'no'}
                action={chooseSpeakingSubmissions}
                options={[
                  { value: 'yes', label: t.settings.speakingOn, hint: t.settings.speakingOnHint },
                  { value: 'no', label: t.settings.speakingOff, hint: t.settings.speakingOffHint },
                ]}
              />
            </section>
          </SettingsPanel>

        </SettingsTabs>
      </main>
    </>
  )
}
