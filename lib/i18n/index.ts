import { createElement, Fragment, type ReactNode } from 'react'
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config'
import { en, type Messages } from './messages/en'
import { fr } from './messages/fr'
import { ja } from './messages/ja'

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
const DICTS: Partial<Record<Locale, Messages>> = { en, fr, ja }

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

/**
 * One translated sentence that contains markup, rendered as nodes.
 *
 * This exists because the alternative was splitting a sentence into two or
 * three keys around its <em> or its link — and that only works in a language
 * whose word order matches English. Japanese puts the verb last, so
 * "You spoke {pct} of your last lesson." came back with an empty trailing
 * fragment, which is correct Japanese and a broken key. The translator kept
 * rejecting it, correctly.
 *
 * Two forms, both survive a JSON round trip and both read as markup to
 * someone editing the raw file:
 *
 *   **bold**   -> <strong>
 *   {name}     -> whatever node the caller passes under that name
 *
 * A slot with no node falls back to the literal "{name}", so a typo shows up
 * on the page as a bug report rather than as the word "undefined".
 *
 * Deliberately the only markup supported. Anything more and this becomes a
 * Markdown renderer with an injection surface, in a file a model writes into.
 */
export function rich(text: string, slots: Record<string, ReactNode> = {}): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\{\w+\})/g)
    .filter(Boolean)
    .map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return createElement('strong', { key: i }, part.slice(2, -2))
      }
      const slot = /^\{(\w+)\}$/.exec(part)
      if (slot && slot[1] in slots) {
        return createElement(Fragment, { key: i }, slots[slot[1]])
      }
      return createElement(Fragment, { key: i }, part)
    })
}

export type { Messages }
export * from './config'
