/** Teacher settings (file-based, single-teacher). */
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

export type Platform = 'google_meet' | 'zoom'
export type Settings = { platform: Platform }

const DEFAULTS: Settings = { platform: 'google_meet' }

export async function getSettings(): Promise<Settings> {
  try {
    return { ...DEFAULTS, ...JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf-8')) }
  } catch {
    return DEFAULTS
  }
}

export async function setPlatform(platform: Platform): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const s = await getSettings()
  await fs.writeFile(SETTINGS_FILE, JSON.stringify({ ...s, platform }, null, 2), 'utf-8')
}
