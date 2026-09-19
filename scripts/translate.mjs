/**
 * Translate lib/i18n/messages/en.ts into French and Japanese.
 *
 * Ported from the marketing site's copy of this script, which is the only
 * duplication here that earns itself: the two apps have separate dictionaries
 * and separate deploys, and a shared package between two repos that are never
 * released together costs more than one file does.
 *
 *   npx tsx scripts/translate.mjs           # only languages with no file yet
 *   npx tsx scripts/translate.mjs --all     # redo every language
 *   npx tsx scripts/translate.mjs es ja     # just these
 *
 * The English file is imported and serialised rather than parsed as text, so
 * the shape handed to the model is the shape the app actually uses — nested
 * objects, arrays in order, nothing lost to a regex. (Hence tsx: plain Node
 * cannot import the .ts source.)
 *
 * What comes back is checked against the English structure before it is
 * written. A model that helpfully drops an empty string, merges two array
 * items or renames a key produces a file that does not compile, and finding
 * that out at build time in a language nobody here reads is exactly the
 * failure this check exists to prevent.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { en } from "../lib/i18n/messages/en"

const MODEL = "gpt-4.1"

/**
 * Fewer than the marketing site's six, on purpose — see lib/i18n/config.ts.
 * Adding one is a line here plus a line in LOCALES and index.ts.
 */
const LANGS = {
  fr: "French (France)",
  ja: "Japanese",
}

/** Names that must survive untranslated, and the reason is search results. */
const KEEP = [
  "KOKU Labs", "Lesson Studio", "Lesson Journal", "Chrome", "Stripe",
  "Zoom", "Google Meet", "Preply", "italki", "Skype", "Noa",
]

function env() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim()
  for (const p of ["../.env.local", "../../lesson-journal/.env.local"]) {
    try {
      const file = readFileSync(new URL(p, import.meta.url), "utf8")
      for (const line of file.split(String.fromCharCode(10))) {
        const t = line.trim()
        if (t.startsWith("OPENAI_API_KEY=")) return t.slice("OPENAI_API_KEY=".length).trim()
      }
    } catch {}
  }
  return ""
}

const KEY = env()
if (!KEY) {
  console.error("No OPENAI_API_KEY found (env, or a sibling app's .env.local).")
  process.exit(1)
}

// The English messages, read as the app reads them. Run this script with tsx
// so the import above resolves the .ts source rather than a build artefact.
const english = JSON.parse(JSON.stringify(en))

/** Same keys, same array lengths, strings still strings — recursively. */
/**
 * Arrays of headline LINES may change length; arrays of data may not.
 *
 * "It changed the / relationship, not just / the admin." is three lines
 * because that is where English wants to break. Portuguese says the same
 * thing in two, and forcing a third produced an empty one — twice. A line
 * break is typography, not content. Everything else (features, steps, packs)
 * is data, and a missing item there is a missing feature.
 */
const isLineArray = (path) => /(^|\.)title$|Title$/.test(path)

function sameShape(a, b, path = "") {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return `${path}: expected an array`
    if (a.length !== b.length && !(isLineArray(path) && b.length > 0 && b.every((x) => typeof x === "string" && x.trim()))) {
      return `${path}: ${a.length} items expected, got ${b.length}`
    }
    if (a.length !== b.length) return null // a line array that legitimately differs
    for (let i = 0; i < a.length; i++) {
      const bad = sameShape(a[i], b[i], `${path}[${i}]`)
      if (bad) return bad
    }
    return null
  }
  if (a && typeof a === "object") {
    if (!b || typeof b !== "object" || Array.isArray(b)) return `${path}: expected an object`
    for (const k of Object.keys(a)) {
      if (!(k in b)) return `${path}.${k}: missing`
      const bad = sameShape(a[k], b[k], `${path}.${k}`)
      if (bad) return bad
    }
    for (const k of Object.keys(b)) if (!(k in a)) return `${path}.${k}: not in English`
    return null
  }
  if (typeof a === "string") {
    if (typeof b !== "string") return `${path}: expected a string`
    if (a.trim() && !b.trim()) return `${path}: came back empty`
    // A placeholder the component will substitute into. Losing one turns a
    // sentence into a lie ("3 recaps free" becomes " recaps free").
    const want = [...a.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",")
    const got = [...b.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",")
    if (want !== got) return `${path}: placeholders changed ({${want}} → {${got}})`
    return null
  }
  return null
}

async function translate(code, label) {
  const prompt = `You are translating the marketing copy of a website into ${label}.

The site sells two products to private language teachers and their students: recordings of a lesson are turned into a written recap, vocabulary, progress charts and practice tests.

Return ONLY a JSON object with EXACTLY the same keys, nesting and array lengths as the input. Translate only the string VALUES. Never translate, rename or reorder a key.

Voice: calm, plain, concrete. Short sentences. It is not excitable marketing copy and must not become excitable in translation — no exclamation marks that are not in the original, no invented superlatives. Where the English is understated, stay understated.

Rules:
- Leave these exactly as they are, they are names: ${KEEP.join(", ")}.
- Keep every {placeholder} exactly as written, same spelling, same count. They are substituted at runtime.
- Keep the $ in prices. Do not convert currencies or numbers.
- Keep markup-ish characters (→, ·, —, &) as they are.
- "recap" / "write-up" both mean the written summary of a lesson. Pick ONE natural term in ${label} and use it consistently everywhere.
- Text in a button or a pill must stay short enough to fit a button.
- Where the English names a script or a language (Japanese, Korean, romaji, kana, pinyin), keep the meaning precise — these are technical, not decorative.

INPUT:
${JSON.stringify(english, null, 2)}`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  return JSON.parse(json.choices[0].message.content)
}

const args = process.argv.slice(2)
const all = args.includes("--all")
const named = args.filter((a) => !a.startsWith("--"))
const targets = named.length ? named : Object.keys(LANGS)

for (const code of targets) {
  const label = LANGS[code]
  if (!label) {
    console.error(`${code}: not a language the app is translated into`)
    continue
  }
  const out = new URL(`../lib/i18n/messages/${code}.ts`, import.meta.url)
  if (!all && !named.length && existsSync(out)) {
    console.log(`${code}  exists, skipped (use --all to redo)`)
    continue
  }

  process.stdout.write(`${code}  translating… `)
  const translated = await translate(code, label)

  const bad = sameShape(english, translated)
  if (bad) {
    console.log(`REJECTED — ${bad}`)
    console.log(`     nothing written; re-run to try again.`)
    continue
  }

  writeFileSync(
    out,
    `/**\n` +
      ` * ${label} — generated from messages/en.ts by scripts/translate.mjs.\n` +
      ` *\n` +
      ` * Edit en.ts and re-run rather than editing this file: a hand-fix here is\n` +
      ` * lost the next time the English changes, and the shape is checked against\n` +
      ` * English on the way in so the two cannot drift apart silently.\n` +
      ` */\n` +
      `import type { Messages } from "./en"\n\n` +
      `export const ${code}: Messages = ${JSON.stringify(translated, null, 2)} as const\n`,
    "utf8"
  )
  console.log("written")
}

console.log("\nDone. `npm run build` will fail loudly if any key is missing.")
