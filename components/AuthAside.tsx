/**
 * The panel beside the sign-in and sign-up forms.
 *
 * It is the only page a teacher can reach without an account, so it is also the
 * only chance to say what this is for. It used to be a headline over some
 * floating shapes — pretty, and it told a teacher landing here nothing about
 * what they would get. Four claims, each one a thing the product actually does.
 *
 * Hidden under 900px (see .k-auth-side) — on a phone the form is the page.
 */

const FEATURES = [
  {
    icon: '🎙️',
    title: 'The lesson writes itself up',
    body: 'A Chrome extension records both voices. The recap comes back drafted — you edit and publish.',
  },
  {
    icon: '📈',
    title: 'Progress they can actually see',
    body: 'Scores, talk-time and vocabulary tracked lesson to lesson, on a page built for the student.',
  },
  {
    icon: '✍️',
    title: 'Practice from their own words',
    body: 'Flashcards and speaking tests made from the vocabulary that came up in the hour.',
  },
  {
    icon: '🎨',
    title: 'A student portal with your name on it',
    body: 'Your colours, your wording, and only the sections you teach with.',
  },
]

export default function AuthAside({ headline, sub }: { headline: string; sub: string }) {
  return (
    <aside className="k-auth-side">
      <div className="k-auth-art" aria-hidden>
        <span className="k-orb" style={{ width: 132, height: 132, left: '14%', top: '6%' }} />
        <span className="k-tube" style={{ width: 104, height: 104, right: '14%', top: '30%', transform: 'rotate(-24deg)' }} />
        <span className="k-crystal" style={{ width: 62, height: 72, left: '54%', top: '0%' }} />
        <span className="k-ring" style={{ width: 52, height: 52, left: '8%', top: '52%' }} />
      </div>

      <div className="k-auth-copy">
        <h2>{headline}</h2>
        <p>{sub}</p>

        <ul className="k-auth-feats">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <span className="k-auth-feat-ic" aria-hidden>{f.icon}</span>
              <span>
                <b>{f.title}</b>
                <small>{f.body}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
