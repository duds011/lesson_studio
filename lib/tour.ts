/**
 * The walkthrough a new teacher actually needs: adding their first student.
 *
 * It used to be five stops along the sidebar saying what each window was —
 * a table of contents, read once and closed, after which the teacher still had
 * an empty workspace and nothing to do in it. The one thing standing between a
 * new account and a working one is a student: no student, no lesson to record,
 * no recap, no portal to show anyone. So the tour is that job.
 *
 * Each step spotlights the control needed next and waits for the teacher to
 * USE it — the route changing, the dialog opening, the student existing —
 * rather than for a Next button. A step that is only to be read carries Next;
 * a step that is a thing to do does not, because "Next" beside "Add student"
 * is two ways forward and one of them is wrong.
 */

export type TourStep = {
  /** The `data-tour` attribute of the element to spotlight. */
  target: string
  /**
   * What ends this step.
   *
   * `route` — the pathname starts with this. `event` — the app called
   * `tourDid()` with this name. Absent means there is nothing to do but read,
   * and the card gets a Next button.
   */
  until?: { kind: 'route'; value: string } | { kind: 'event'; value: string }
}

/**
 * Anchors only. The words are in `t.tour.steps`, paired by position, and the
 * translation shape check keeps the two arrays the same length — so a step
 * added here without copy fails the build rather than rendering blank.
 */
export const TOUR_STEPS: TourStep[] = [
  // Where students live. Ends when they actually go there.
  { target: 'students', until: { kind: 'route', value: '/teacher/dashboard' } },
  // The button. Ends when the dialog opens.
  { target: 'add-student', until: { kind: 'event', value: 'add-student-open' } },
  // The form. Ends when the student exists — however long that takes them.
  { target: 'add-student-form', until: { kind: 'event', value: 'student-created' } },
  // The invite link, which is the whole point: a student with no link is a row
  // in a table. This one is read, so it is the one step with a button.
  { target: 'invite-link' },
]

/** Where the tour has got to, per account — see GuidedTour. */
export const tourDoneKey = (email?: string | null) => `ls.tour.done:${email || 'anon'}`
export const tourAtKey = (email?: string | null) => `ls.tour.at:${email || 'anon'}`

/** Fired by the Settings replay button; the tour listens app-wide. */
export const TOUR_EVENT = 'ls:tour'
/** Fired by the app when the teacher does something a step is waiting for. */
export const TOUR_DID_EVENT = 'ls:tour-did'

/**
 * Tell the tour that something happened.
 *
 * Deliberately a window event rather than a prop or a context: the things the
 * tour waits for happen inside components that have no idea a tour exists, and
 * should not have to grow a prop to acquire one. Calling this when no tour is
 * running costs an event nobody is listening to.
 */
export function tourDid(name: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TOUR_DID_EVENT, { detail: name }))
}
