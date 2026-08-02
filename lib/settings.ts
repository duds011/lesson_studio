/** Teacher settings — backed by Vercel KV in prod, local files in dev. */
import { readDoc, writeDoc } from './docstore'
import { requireTeacherId } from './current-teacher'

export type Platform = 'google_meet' | 'zoom'
export type Settings = { platform: Platform }

const DEFAULTS: Settings = { platform: 'google_meet' }

const key = async (teacherId?: string) => `settings:${teacherId ?? (await requireTeacherId())}`

export async function getSettings(teacherId?: string): Promise<Settings> {
  const s = await readDoc<Partial<Settings>>(await key(teacherId))
  return { ...DEFAULTS, ...(s ?? {}) }
}

export async function setPlatform(platform: Platform, teacherId?: string): Promise<void> {
  const s = await getSettings(teacherId)
  await writeDoc(await key(teacherId), { ...s, platform })
}
