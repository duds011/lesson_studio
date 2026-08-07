import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * How to install the recorder.
 *
 * Public on purpose: a teacher trying it out lands here from onboarding, and
 * anyone testing the beta can be sent this link directly without an account
 * first. It signs nobody in and shows nothing private.
 */
export default async function RecorderPage() {
  const supabase = await createClient()
  const user = await currentUser(supabase)

  return (
    <main className="main-wrap page-fade" style={{ maxWidth: 720 }}>
      <header style={{ marginBottom: 26 }}>
        <span className="eyebrow">Lesson recorder</span>
        <h1 style={{ marginTop: 6 }}>Record a lesson, get a recap</h1>
        <p className="sub">
          A Chrome extension that records your lesson tab and your microphone as two separate
          tracks, then turns them into a draft recap here. No bot joins the call, and nothing is
          installed on your student&rsquo;s side.
        </p>
      </header>

      <section className="lesson-block" style={{ marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>1. Install it</h3>
        <p className="sub" style={{ marginBottom: 12 }}>
          The extension is in private beta, so it installs from a folder rather than the Chrome
          Web Store. It takes a minute, once.
        </p>
        <ol style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 7 }}>
          <li>Download the recorder folder and unzip it somewhere you won&rsquo;t delete.</li>
          <li>Open <code>chrome://extensions</code> in Chrome.</li>
          <li>Turn on <strong>Developer mode</strong>, top right.</li>
          <li>Click <strong>Load unpacked</strong> and pick the folder.</li>
          <li>Pin the extension so you can reach it mid-lesson.</li>
        </ol>
      </section>

      <section className="lesson-block" style={{ marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>2. Sign in</h3>
        <p className="sub" style={{ margin: 0 }}>
          Open the extension and sign in with the same email and password you use here. That is
          all the setup there is — it knows who you are, which students are yours, and which
          language you teach.
        </p>
      </section>

      <section className="lesson-block" style={{ marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>3. Record</h3>
        <ol style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 7 }}>
          <li>Open the lesson itself — the Preply, italki or Meet tab, not a background one.</li>
          <li>Click the extension, pick the student, and hit <strong>Start recording</strong>.</li>
          <li>The first time only, Chrome asks for your microphone. Allow it.</li>
          <li>Teach. You can close the popup; recording carries on.</li>
          <li>Hit <strong>Stop recording</strong> at the end, then <strong>Send to Lesson Studio</strong>.</li>
        </ol>
        <p className="sub" style={{ margin: '12px 0 0' }}>
          The draft recap appears under <strong>Recaps to review</strong> on your overview. Nothing
          reaches the student until you approve it.
        </p>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>Before you record someone</h3>
        <p className="sub" style={{ marginTop: 0 }}>
          Tell your student you are recording and get their agreement. Some places require
          everyone on a call to consent, and Preply and italki each have their own terms about
          recording lessons — worth a look before you make this part of how you teach.
        </p>
        <p className="sub" style={{ margin: 0 }}>
          The recorder captures both voices. Nothing is uploaded until you press{' '}
          <strong>Send to Lesson Studio</strong>, audio is transcribed by OpenAI to write the
          recap, and the files are deleted 30 days later. The full detail is in our{' '}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

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
