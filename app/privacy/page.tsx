import Link from 'next/link'

export const metadata = {
  title: 'Privacy — Lesson Studio',
  description: 'What Lesson Studio and the Lesson Studio Recorder collect, and what happens to it.',
}

/**
 * The privacy policy.
 *
 * Public and unauthenticated on purpose: the Chrome Web Store requires a
 * reachable policy URL before it will accept the extension, and a reviewer
 * hits it signed out. The middleware matcher does not cover /privacy, so it
 * stays open — check that before adding routes to the matcher.
 *
 * Every claim here is checkable against the code. If the pipeline changes, this
 * page changes with it: an out-of-date policy is worse than a blunt one.
 */

/** One place to change it. Also the address on the Chrome developer account. */
const CONTACT = 'wogaoliveira@gmail.com'
const UPDATED = '7 August 2026'

export default function PrivacyPage() {
  return (
    <main className="main-wrap page-fade" style={{ maxWidth: 760 }}>
      <header style={{ marginBottom: 26 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ marginTop: 6 }}>Privacy</h1>
        <p className="sub">
          What Lesson Studio and the Lesson Studio Recorder extension collect, who else touches
          it, and how long it is kept. Last updated {UPDATED}.
        </p>
      </header>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>The short version</h3>
        <ul>
          <li>
            The recorder captures <strong>your microphone</strong> and <strong>the audio your
            lesson tab plays</strong> — which is your student&rsquo;s voice. Both people on the
            call are recorded.
          </li>
          <li>
            Nothing is uploaded until you press <strong>Send to Lesson Studio</strong>. Stop
            without sending and the audio never leaves your browser.
          </li>
          <li>
            Uploaded audio is transcribed by OpenAI to write your recap, then{' '}
            <strong>deleted 30 days after upload</strong>.
          </li>
          <li>
            No browsing history, no page content, no analytics, no advertising, and nothing is
            ever sold.
          </li>
        </ul>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>What the extension collects</h3>
        <ul>
          <li>
            <strong>Microphone audio.</strong> Recorded only between your pressing Start and
            Stop, and held in the browser until you send it.
          </li>
          <li>
            <strong>Tab audio.</strong> The sound the lesson tab is playing, captured for the
            same window. On a video call this is the other participant.
          </li>
          <li>
            <strong>Your email address and password,</strong> to sign you in to your existing
            Lesson Studio account. The password is sent to our authentication provider and is
            never stored by the extension; only the resulting session token is kept, in your
            browser.
          </li>
          <li>
            <strong>Your student list and the language you teach,</strong> fetched so the popup
            can offer them, and cached in your browser.
          </li>
        </ul>
        <p className="sub" style={{ margin: '12px 0 0' }}>
          The extension has no permission to read the pages you visit and does not do so. It
          asks for access to two addresses — this app and our Supabase project — and to capture
          audio from the tab you invoke it on. It reads no browsing history and injects no
          scripts into any page.
        </p>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>What happens to a recording</h3>
        <ol style={{ paddingLeft: 19, margin: 0, display: 'grid', gap: 8 }}>
          <li>
            Both tracks upload directly to a <strong>private</strong> storage bucket. They are
            not public, not listed, and not reachable without a signed link generated for your
            account.
          </li>
          <li>
            Each track is transcribed by <strong>OpenAI</strong> (Whisper). Because the two
            voices are on separate tracks, no voice analysis or speaker identification is
            performed — who said what is known from which track it was on.
          </li>
          <li>
            The transcript is sent to <strong>OpenAI</strong> once more to write the draft
            recap. The transcript is kept beside the audio and{' '}
            <strong>deleted on the same 30-day schedule</strong>, so a recap can be rebuilt
            under an improved prompt without transcribing the lesson a second time. It is never
            shown to the student. What is kept for good is the recap itself, your talk-time
            totals in seconds, and the numeric fluency metrics.
          </li>
          <li>
            The draft waits in <em>Recaps to review</em> until you approve it. Nothing reaches a
            student before you do.
          </li>
          <li>
            The audio files are <strong>deleted 30 days after upload</strong> by a daily job.
            Until then they remain available so a recap can be rebuilt under an improved prompt.
          </li>
        </ol>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>Who else processes it</h3>
        <ul>
          <li>
            <strong>Supabase</strong> — authentication, database, and the audio storage bucket.
          </li>
          <li>
            <strong>OpenAI</strong> — transcription and recap writing. Content submitted through
            OpenAI&rsquo;s API is not used to train their models.
          </li>
          <li>
            <strong>Vercel</strong> — hosting for this app.
          </li>
        </ul>
        <p className="sub" style={{ margin: '12px 0 0' }}>
          These are service providers acting on our instructions. Your data is not sold,
          licensed, or shared with anyone else, and it is never used for advertising, credit
          scoring, or lending decisions.
        </p>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>Consent is yours to get</h3>
        <p className="sub" style={{ margin: 0 }}>
          You control the recording, so you are responsible for it. Tell your student before you
          record, and get their agreement. Several countries and US states require every
          participant on a call to consent, and Preply, italki and Google Meet each have their
          own rules about recording lessons. If a student asks you to delete a recording,{' '}
          <a href={`mailto:${CONTACT}`}>write to us</a> and we will remove it and anything
          derived from it.
        </p>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>Security and your rights</h3>
        <ul>
          <li>Everything travels over TLS. The storage bucket is private and size-capped.</li>
          <li>
            Database access is governed by row-level security, so a signed-in teacher reaches
            only their own students and recaps.
          </li>
          <li>
            You can delete a student, a recap, or your whole account from within the app. To
            have everything erased at once, or to ask what is held about you, write to{' '}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </li>
        </ul>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>Chrome Web Store and Google API disclosures</h3>
        <p className="sub" style={{ marginTop: 0 }}>
          Lesson Studio Recorder&rsquo;s use and transfer of information received from the Chrome
          Web Store adheres to the{' '}
          <a
            href="https://developer.chrome.com/docs/webstore/program-policies/user-data-faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chrome Web Store User Data Policy
          </a>
          , including the Limited Use requirements. Data collected by the extension is used only
          to provide the recording and recap features described on its store listing and in its
          interface.
        </p>
        <p className="sub" style={{ marginBottom: 0 }}>
          Where you connect a Google Calendar to Lesson Studio, our use and transfer of
          information received from Google APIs adheres to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. Calendar data is used only to show your
          lessons and match them to students.
        </p>
      </section>

      <section className="lesson-block">
        <h3 style={{ marginTop: 0 }}>Changes, and how to reach us</h3>
        <p className="sub" style={{ margin: 0 }}>
          If what we collect or how we use it changes, this page is updated and the date at the
          top moves. Where the change is significant, we will say so in the app and in the
          extension rather than relying on you to re-read this. Questions, deletion requests, or
          anything else: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </section>

      <p style={{ marginTop: 22 }}>
        <Link href="/recorder" className="btn btn-ghost btn-sm">
          ← Back to the recorder
        </Link>
      </p>
    </main>
  )
}
