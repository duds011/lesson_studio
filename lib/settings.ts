/** Teacher settings — backed by Vercel KV in prod, local files in dev. */
import { readDoc, writeDoc } from './docstore'

export type Platform = 'google_meet' | 'zoom'
export type Settings = { platform: Platform }

const DEFAULTS: Settings = { platform: 'google_meet' }

export async function getSettings(): Promise<Settings> {
  const s = await readDoc<Partial<Settings>>('settings')
  return { ...DEFAULTS, ...(s ?? {}) }
}

export async function setPlatform(platform: Platform): Promise<void> {
  const s = await getSettings()
  await writeDoc('settings', { ...s, platform })
}
