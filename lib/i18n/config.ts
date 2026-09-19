/**
 * The languages the app's interface is written in.
 *
 * The same seven as kokulabs.net, and that is the point: a teacher who read
 * the site in French and then signs up should not arrive in English. Matching
 * the site also means one translation pipeline and one list to extend.
 *
 * Seven is NOT the same number as the twenty-seven in lib/languages.ts. That
 * list is what a lesson can be taught and written up in — content the model
 * generates. This list is chrome somebody has to keep true by hand every time
 * a button changes its label. Conflating the two would promise a Thai student
 * a Thai interface because their recaps are in Thai.
 */
export const LOCALES = ['en', 'es', 'pt', 'fr', 'ja', 'de', 'it'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/**
 * What each language calls itself.
 *
 * Endonyms, not English names: a Japanese teacher scanning the picker finds
 * 日本語 instantly, and "Japanese" only if they already read English — which
 * is the thing this whole feature is not assuming.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  ja: '日本語',
  de: 'Deutsch',
  it: 'Italiano',
}

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v)
}

/**
 * A teaching language (lib/languages.ts, English names) → an interface locale.
 *
 * This is what lets the student portal have no language setting of its own.
 * A student already tells us which language they want their recaps written
 * in — the language they read most comfortably — so the chrome around the
 * recap should follow it rather than ask the same question twice.
 *
 * Only the seven we have an interface for appear here. A student who reads
 * Thai gets Thai recaps and an English portal, which is the honest state of
 * affairs; adding Thai here without a messages/th.ts would just crash.
 */
const TEACHING_LANGUAGE_LOCALE: Record<string, Locale> = {
  English: 'en',
  Spanish: 'es',
  Portuguese: 'pt',
  French: 'fr',
  Japanese: 'ja',
  German: 'de',
  Italian: 'it',
}

export function localeForTeachingLanguage(name?: string | null): Locale | null {
  if (!name) return null
  const hit = TEACHING_LANGUAGE_LOCALE[name.trim()]
  return hit ?? null
}

/**
 * Which of our languages a browser is asking for, if any.
 *
 * Tags are BCP-47 — "pt-BR", "es-419", "de-AT" — so only the primary subtag
 * is compared. A Brazilian and a Portuguese teacher get the same interface;
 * that is a real difference we are choosing not to maintain twice.
 */
export function matchLocale(tags: readonly string[]): Locale | null {
  for (const tag of tags) {
    const base = String(tag || '').toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return null
}

/**
 * Parse an Accept-Language header into locales, best first.
 *
 * Used only for a teacher's FIRST visit, before they have a saved preference.
 * The header is quality-weighted ("en-GB,en;q=0.9,fr;q=0.8") and browsers do
 * not always send it in order, so the weights are honoured rather than
 * assumed.
 */
export function matchAcceptLanguage(header?: string | null): Locale | null {
  if (!header) return null
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
      return { tag: tag.trim(), q: q ? Number(q.slice(2)) || 0 : 1 }
    })
    .filter((t) => t.tag)
    .sort((a, b) => b.q - a.q)
    .map((t) => t.tag)
  return matchLocale(tags)
}
