import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config'
import { en, type Messages } from './messages/en'
import { es } from './messages/es'
import { pt } from './messages/pt'
import { fr } from './messages/fr'
import { ja } from './messages/ja'
import { de } from './messages/de'
import { it } from './messages/it'

/**
 * The interface copy for one language.
 *
 * A plain object from a plain module. Server components read it directly;
 * client components get the resolved locale from I18nProvider and call the
 * same function. There is no separate client and server path, which is what
 * keeps a string from being translated on one and not the other.
 *
 * Deliberately Partial. A language whose file does not exist yet falls back
 * to English rather than throwing, so the app is never broken by a
 * translation being half-done — and `missingLocales()` says which ones are
 * still standing in, instead of that being something you find out from a
 * screenshot.
 */
const DICTS: Partial<Record<Locale, Messages>> = { en, es, pt, fr, ja, de, it }

export function getDict(locale?: string | null): Messages {
  if (!isLocale(locale)) return DICTS[DEFAULT_LOCALE]!
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE]!
}

/** Locales that currently render as English because their file is not built. */
export function missingLocales(): Locale[] {
  return LOCALES.filter((l) => !DICTS[l])
}

/**
 * Fill {placeholders} in a string.
 *
 * Small on purpose: the substitutions this app needs are a count, a name or a
 * date already formatted elsewhere. An i18n library that also does plurals,
 * genders and dates would be more machinery than there are strings.
 *
 * A placeholder with no value is left exactly as written rather than becoming
 * "undefined" — a visible {n} on the page is a bug report; the word
 * "undefined" mid-sentence is a mystery.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key) =>
    key in values ? String(values[key]) : whole,
  )
}

export type { Messages }
export * from './config'
