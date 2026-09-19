/**
 * The languages the app's interface is written in.
 *
 * Three, deliberately fewer than the marketing site's seven, and the
 * asymmetry is the point rather than an oversight. A sales page is written
 * once and changes a few times a year; app chrome changes every time a button
 * gets a better label, and each of those edits is a re-translation of every
 * language before it can ship. Seven files of that is a tax on every future
 * copy change, paid before anyone has asked for Spanish.
 *
 * English, French and Japanese because those are the ones with a real reader
 * today. Adding a language is: put it in this list and LOCALE_NAMES, map any
 * teaching language onto it below, run scripts/translate.mjs, import it in
 * index.ts. Four small edits and no migration — the column takes a wider set
 * than this list on purpose.
 *
 * Three is NOT the twenty-seven in lib/languages.ts. That list is what a
 * lesson can be taught and written up in — content the model generates. This
 * is chrome somebody keeps true by hand. Conflating the two would promise a
 * Thai student a Thai interface because their recaps are in Thai.
 */
export const LOCALES = ['en', 'fr', 'ja'] as const

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
  fr: 'Français',
  ja: '日本語',
}

/**
 * Where a signed-out visitor's choice is kept.
 *
 * A cookie rather than localStorage because the login and signup pages are
 * server-rendered: localStorage is not readable while the HTML is being
 * built, so the page would arrive in English and flip afterwards. A cookie is
 * on the request, so the first paint is already right.
 *
 * Read on the server by publicLocale(); written on the client by
 * LocaleSwitch. Not httpOnly for that reason.
 */
export const LOCALE_COOKIE = 'koku_lang'

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
 * Only the three we have an interface for appear here. A student who reads
 * Spanish gets Spanish recaps and an English portal, which is the honest
 * state of affairs today; adding a name here without a matching messages
 * file would just hand getDict a locale it cannot serve.
 */
const TEACHING_LANGUAGE_LOCALE: Record<string, Locale> = {
  English: 'en',
  French: 'fr',
  Japanese: 'ja',
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
