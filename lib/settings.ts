/** Teacher settings — backed by Vercel KV in prod, local files in dev. Per-teacher. */
import { readDoc, writeDoc } from './docstore'

export type Platform = 'google_meet' | 'zoom'
export type Settings = { platform: Platform }

const DEFAULTS: Settings = { platform: 'google_meet' }
const key = (teacherId: string) => `settings:${teacherId}`

export async function getSettings(teacherId: string): Promise<Settings> {
  const s = await readDoc<Partial<Settings>>(key(teacherId))
  return { ...DEFAULTS, ...(s ?? {}) }
}

export async function setPlatform(teacherId: string, platform: Platform): Promise<void> {
  const s = await getSettings(teacherId)
  await writeDoc(key(teacherId), { ...s, platform })
}
