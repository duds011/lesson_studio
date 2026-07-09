/**
 * Tiny document store. Uses Vercel KV / Upstash Redis when its env vars are
 * present (production), otherwise falls back to local JSON files (dev).
 * Each "doc" is a named JSON blob (a token, settings, the bots map, etc.).
 */
import { promises as fs } from 'fs'
import path from 'path'

// Find the Upstash/KV REST URL + token, tolerating any prefix the Vercel
// integration used (e.g. STORAGE_KV_REST_API_URL from a "STORAGE" prefix).
function findCred(suffix: RegExp, exclude?: RegExp): string | undefined {
  const env = process.env
  const key = Object.keys(env).find((k) => suffix.test(k) && (!exclude || !exclude.test(k)) && env[k])
  return key ? env[key] : undefined
}
const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || findCred(/REST_API_URL$/)
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  findCred(/REST_API_TOKEN$/, /READ_ONLY/)
export const kvEnabled = Boolean(KV_URL && KV_TOKEN)

const DATA_DIR = path.join(process.cwd(), '.data')
const SEED_DATA_DIR = path.join(process.cwd(), 'content', 'runtime-data')

async function kvCommand(args: (string | number)[]): Promise<any> {
  const res = await fetch(KV_URL as string, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV ${args[0]} failed (${res.status}): ${await res.text()}`)
  return (await res.json()).result
}

export async function readDoc<T = any>(name: string): Promise<T | null> {
  if (kvEnabled) {
    const v = await kvCommand(['GET', `doc:${name}`])
    return v ? (JSON.parse(v) as T) : null
  }
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `${name}.json`), 'utf-8')) as T
  } catch {
    try {
      return JSON.parse(await fs.readFile(path.join(SEED_DATA_DIR, `${name}.json`), 'utf-8')) as T
    } catch {
      return null
    }
  }
}

export async function writeDoc(name: string, obj: unknown): Promise<void> {
  if (kvEnabled) {
    await kvCommand(['SET', `doc:${name}`, JSON.stringify(obj)])
    return
  }
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(obj, null, 2), 'utf-8')
}

export async function delDoc(name: string): Promise<void> {
  if (kvEnabled) {
    await kvCommand(['DEL', `doc:${name}`])
    return
  }
  try {
    await fs.unlink(path.join(DATA_DIR, `${name}.json`))
  } catch {
    /* already gone */
  }
}
