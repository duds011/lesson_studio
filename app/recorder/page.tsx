import Link from 'next/link'
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

  return (
    <main className="main-wrap page-fade" style={{ maxWidth: 760 }}>
      <header style={{ marginBottom: 34 }}>
        <span className="eyebrow">Lesson recorder</span>
        <h1 style={{ marginTop: 6 }}>Record a lesson, get a recap</h1>
        <p className="sub" style={{ maxWidth: '56ch' }}>
          A Chrome extension that records your lesson tab and your microphone as two separate
          tracks, then turns them into a draft recap here. No bot joins the call, nothing is
          installed on your student&rsquo;s side — it works on Preply, italki, Google Meet, Zoom,
          anywhere your lesson lives in a tab.
        </p>
      </header>

      {/* 1 — install */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">1</span>
          <div className="rg-body">
            <h3>Install it from the Chrome Web Store</h3>
            <p>
              One click, no settings. Then pin it — click the puzzle piece next to the address
              bar and tap the pin — so the K is always in reach mid-lesson.
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
                    <div className="rg-store-name">Lesson Studio Recorder</div>
                    <div className="rg-store-sub">by KOKU Labs · Free</div>
                  </div>
                  <span className="rg-cta">Add to Chrome</span>
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
              Add to Chrome — it&rsquo;s free ↗
            </a>
            <p className="sub" style={{ margin: '12px 0 0', fontSize: 12 }}>
              <strong>Tested the beta from a folder?</strong> Remove that copy first
              (<code>chrome://extensions</code> → Remove). Only one copy can record a tab at a
              time.
            </p>
          </div>
        </div>
      </Reveal>

      {/* 2 — sign in */}
      <Reveal>
        <div className="rg-step">
          <span className="rg-n">2</span>
          <div className="rg-body">
            <h3>Sign in — once</h3>
            <p>
              Open the extension and sign in with the same email and password you use here.
              That&rsquo;s the whole setup: it knows who you are, which students are yours, and
              which language you teach.
            </p>
            <div className="rg-art">
              <div className="rg-popup">
                <div className="rg-pop-head"><span className="rg-pin">K</span> Lesson Studio Recorder</div>
                <div className="rg-pop-body">
                  <span className="rg-field">you@example.com</span>
                  <span className="rg-field">••••••••</span>
                  <span className="rg-rec-btn" style={{ background: 'var(--forest)' }}>Sign in</span>
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
            <h3>Open your lesson tab and hit record</h3>
            <p>
              Be in the tab the lesson actually happens in — the Preply classroom, the Meet
              call. Click the K, pick the student, press <strong>Start recording</strong>. The
              first time, Chrome asks for your microphone: allow it. Then close the popup and
              just teach — recording carries on.
            </p>
            <div className="rg-art">
              <div className="rg-popup">
                <div className="rg-pop-head"><span className="rg-pin">K</span> Recording setup</div>
                <div className="rg-pop-body">
                  <span className="rg-field">Student: <b>Minami</b> ▾</span>
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
            <h3>Stop, then send</h3>
            <p>
              When the lesson ends, open the popup, hit <strong>Stop recording</strong>, then{' '}
              <strong>Send to Lesson Studio</strong>. Nothing is uploaded until you press send.
            </p>
            <div className="rg-art">
              <div className="rg-popup">
                <div className="rg-pop-head"><span className="rg-pin">K</span> Recording</div>
                <div className="rg-pop-body">
                  <span className="rg-timer"><i /> 47:12</span>
                  <span className="rg-rec-btn" style={{ background: 'var(--ink)' }}>■ Stop recording</span>
                  <span className="rg-rec-btn send">Send to Lesson Studio →</span>
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
            <h3>Review the recap it becomes</h3>
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
                <span className="go">Review &amp; send</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section className="lesson-block" style={{ marginTop: 8 }}>
          <h3 style={{ marginTop: 0 }}>Before you record someone</h3>
          <p className="sub" style={{ marginTop: 0 }}>
            Tell your student you are recording and get their agreement. Some places require
            everyone on a call to consent, and Preply and italki each have their own terms about
            recording lessons — worth a look before you make this part of how you teach.
          </p>
          <p className="sub" style={{ margin: 0 }}>
            The recorder captures both voices. Nothing is uploaded until you press{' '}
            <strong>Send to Lesson Studio</strong>, audio is transcribed to write the recap, and
            the files are deleted 30 days later. The full detail is in our{' '}
            <Link href="/privacy">privacy policy</Link>.
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
