import Link from 'next/link'
import { getDict, rich } from '@/lib/i18n'
import { teacherLocale, publicLocale } from '@/lib/i18n/server'
import { createClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/auth'
import { RECORDER_STORE_URL } from '@/lib/recorder'
import Reveal from '@/components/Reveal'

export const dynamic = 'force-dynamic'

/**
 * How to install and use the recorder — with pictures.
 *
 * Public on purpose: a teacher trying it out lands here from onboarding, and
 * anyone testing can be sent this link without an account. The "screenshots"
 * are drawn in markup, the same shapes the real popup uses, so they can't go
 * stale the way a PNG of an old version would. Steps reveal as you scroll.
 */
export default async function RecorderPage() {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  // Reachable signed out (the Web Store listing links here), so fall back to
  // the request when there is nobody to read a preference from.
  const t = getDict(user ? await teacherLocale(supabase, user.id) : await publicLocale())

  return (
    <main className="main-wrap page-fade" style={{ maxWidth: 760 }}>
      <header style={{ marginBottom: 34 }}>
        <span className="eyebrow">{t.guide.eyebrow}</span>
        <h1 style={{ marginTop: 6 }}>{t.guide.title}</h1>
        <p className="sub" style={{ maxWidth: '56ch' }}>
          {t.guide.sub}
        </p>
      </header>

      {/* 1 — install */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">1</span>
          <div className="rg-body">
            <h3>{t.guide.step1Title}</h3>
            <p>
              {t.guide.step1Body}
            </p>
            <div className="rg-art">
              <div className="rg-browser">
                <div className="rg-chrome">
                  <span className="rg-dots"><i /><i /><i /></span>
                  <span className="rg-url">chromewebstore.google.com › lesson-studio-recorder</span>
                  <span className="rg-puzzle" aria-hidden>🧩</span>
                  <span className="rg-pin">K</span>
                </div>
                <div className="rg-page">
                  <div>
                    <div className="rg-store-name">{t.guide.storeName}</div>
                    <div className="rg-store-sub">by KOKU Labs · Free</div>
                  </div>
                  <span className="rg-cta">{t.guide.addToChromeShort}</span>
                </div>
              </div>
            </div>
            <a
              href={RECORDER_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ marginTop: 14 }}
            >
              {t.guide.addToChrome}
            </a>
            <p className="sub" style={{ margin: '12px 0 0', fontSize: 12 }}>
              {rich(t.guide.betaNote, { path: <code>chrome://extensions</code> })}
            </p>
          </div>
        </div>
      </Reveal>

      {/* 2 — sign in */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">2</span>
          <div className="rg-body">
            <h3>{t.guide.step2Title}</h3>
            <p>
              {t.guide.step2Body}
            </p>
            <div className="rg-art">
              <div className="rg-popup">
                <div className="rg-pop-head"><span className="rg-pin">K</span> Lesson Studio Recorder</div>
                <div className="rg-pop-body">
                  <span className="rg-field">you@example.com</span>
                  <span className="rg-field">••••••••</span>
                  <span className="rg-rec-btn" style={{ background: 'var(--forest)' }}>{t.guide.signIn}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 3 — record */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">3</span>
          <div className="rg-body">
            <h3>{t.guide.step3Title}</h3>
            <p>
              {rich(t.guide.step3Body)}
            </p>
            <div className="rg-art">
              <div className="rg-popup">
                <div className="rg-pop-head"><span className="rg-pin">K</span> Recording setup</div>
                <div className="rg-pop-body">
                  <span className="rg-field">{t.guide.studentLabel} <b>Minami</b> ▾</span>
                  <span className="rg-rec-btn start">● Start recording</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 4 — stop & send */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">4</span>
          <div className="rg-body">
            <h3>{t.guide.step4Title}</h3>
            <p>
              {rich(t.guide.step4Body)}
            </p>
            <div className="rg-art">
              <div className="rg-popup">
                <div className="rg-pop-head"><span className="rg-pin">K</span> Recording</div>
                <div className="rg-pop-body">
                  <span className="rg-timer"><i /> 47:12</span>
                  <span className="rg-rec-btn" style={{ background: 'var(--ink)' }}>■ Stop recording</span>
                  <span className="rg-rec-btn send">{t.guide.sendButton}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 5 — review */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">5</span>
          <div className="rg-body">
            <h3>{t.guide.step5Title}</h3>
            <p>
              A few minutes later the draft is waiting under <strong>Recaps to review</strong> on
              your overview — summary, vocabulary, homework, in your student&rsquo;s language.
              Edit anything, hit send, and it lands in their portal. Nothing reaches a student
              until you approve it.
            </p>
            <div className="rg-art">
              <div className="rg-queue-row">
                <span className="num">#4</span>
                <span className="who"><b>Minami</b><span>Lesson 4 · today</span></span>
                <span className="go">{t.guide.reviewAndSend}</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section className="lesson-block" style={{ marginTop: 8 }}>
          <h3 style={{ marginTop: 0 }}>{t.guide.consentTitle}</h3>
          <p className="sub" style={{ marginTop: 0 }}>
            {t.guide.consentBody}
          </p>
          <p className="sub" style={{ margin: 0 }}>
            {rich(t.guide.dataBody, { policy: <Link href="/privacy">{t.guide.privacyLink}</Link> })}
          </p>
        </section>
      </Reveal>

      <p style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link href={user ? '/' : '/login'} className="btn btn-ghost btn-sm">
          {user ? '← Back to your overview' : 'Sign in to Lesson Studio'}
        </Link>
        <Link href="/privacy" className="sub" style={{ fontSize: 12.5 }}>
          Privacy policy
        </Link>
      </p>
    </main>
  )
}
