/**
 * The recap's speaking exercises, named once so the portal, the teacher's page
 * and the notification email all agree on which is which.
 *
 * Every recap carries the same ten exercises in one array; three of them are
 * spoken. A submission is keyed by that exercise's index in the WHOLE array,
 * not its position among the spoken three — the recap JSON is fixed once
 * published, and the full index survives any later change to how they are
 * grouped on the page.
 */
export type Exercise = { type: string; prompt: string; data: any }

export const isSpeaking = (e: Exercise) => e?.type === 'read_aloud' || e?.type === 'speak'

/** Every speaking exercise with the index the rest of the system keys on. */
export function speakingExercises(exercises: Exercise[] | null | undefined) {
  return (Array.isArray(exercises) ? exercises : [])
    .map((ex, index) => ({ ex, index }))
    .filter(({ ex }) => isSpeaking(ex))
}

/** One line naming what the student was asked to say — for lists and mail. */
export function speakingPromptLabel(ex: Exercise): string {
  const d = ex?.data ?? {}
  if (ex?.type === 'read_aloud') {
    // A read-aloud is several sentences answered in one take, so the focus
    // names it better than quoting the first line and implying that was all.
    const focus = String(d.focus ?? '').trim()
    if (focus) return `Read aloud: ${focus}`
    const first = Array.isArray(d.sentences) ? d.sentences[0] : null
    const said = String(first?.jp ?? '').trim()
    if (said) return `Read aloud: ${said}`
  }
  const spoken = String(d.prompt_jp ?? '').trim()
  if (spoken) return spoken
  const english = String(d.prompt_en ?? '').trim()
  if (english) return english
  return String(ex?.prompt ?? 'Speaking exercise').trim()
}
