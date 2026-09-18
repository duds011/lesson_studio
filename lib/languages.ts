/**
 * The language menus, in one place.
 *
 * These used to live inside OnboardingFlow. The add-student form needs the
 * same two lists — a second copy would have drifted, and the drift would show
 * up as a student marked with a language the recap prompts cannot generate.
 */

/**
 * What a student can be learning.
 *
 * This was three — English, French, Japanese — with a comment saying everything
 * else was off the menu "until the prompts are built and tested for it". The
 * prompts were built. Japanese has its own, eight more languages have tailored
 * profiles in lib/openai, and the generic prompt handles the rest on the CEFR
 * scale; lib/whisper resolves every name here to a language code, which is what
 * stops transcription guessing and inventing speech.
 *
 * The narrow list outlived its reason by some months. Lesson Journal — the same
 * engine, the same prompts — has been offering all twenty-seven, so a teacher
 * was being shown a third of what their own students' app could already do.
 *
 * Same list, same order, same spellings as lesson-journal/lib/languages.ts. If
 * one gains a language, so does the other.
 */
export const TEACHING_LANGUAGES = [
  'Japanese', 'Korean', 'Mandarin Chinese', 'Cantonese', 'Vietnamese', 'Thai',
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch',
  'Russian', 'Polish', 'Czech', 'Ukrainian', 'Greek', 'Turkish',
  'Arabic', 'Hebrew', 'Hindi', 'Indonesian', 'Swedish', 'Norwegian', 'Danish',
  'Finnish',
]

/**
 * What a lesson can be explained in.
 *
 * Deliberately much wider than TEACHING_LANGUAGES: that list is narrow because
 * recaps and tests have to be *generated* in those languages. This one is only
 * ever read — it says what the room sounds like — so the only requirement is
 * that lib/whisper can turn it into an ISO code.
 */
export const SPOKEN_LANGUAGES = [
  'English', 'French', 'Japanese', 'Spanish', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Korean', 'Russian', 'Arabic', 'Dutch', 'Polish', 'Turkish',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Hebrew', 'Hindi',
  'Indonesian', 'Thai', 'Vietnamese', 'Ukrainian', 'Czech', 'Romanian', 'Hungarian',
]

/**
 * Example hesitation words for the "hesitation words" metric tile's caption.
 *
 * The COUNT is deliberately cross-language (see FILLERS in lib/transcript.ts:
 * a beginner's hour hesitates in two languages at once) — but the caption is
 * just an illustration, and showing えーと to a French student reads as the
 * app speaking the wrong language.
 */
export function hesitationExamples(language?: string | null): string {
  const l = (language ?? '').toLowerCase()
  if (/japanese|日本語/.test(l)) return 'えーと, あの, うーん…'
  if (/french|français|francais/.test(l)) return 'euh, ben, alors…'
  if (/english|inglês|ingles|英語/.test(l)) return 'um, uh, er…'
  return 'um, euh…'
}

/**
 * The menu plus whatever this teacher already had.
 *
 * A teacher whose profile predates the picker can hold a language that is not
 * on the list. Dropping it would silently re-mark their next student as
 * English, so it gets an option of its own instead.
 */
export function languageOptions(current?: string | null): string[] {
  const extra = (current ?? '').trim()
  if (!extra || TEACHING_LANGUAGES.some((l) => l.toLowerCase() === extra.toLowerCase())) return TEACHING_LANGUAGES
  return [...TEACHING_LANGUAGES, extra]
}
