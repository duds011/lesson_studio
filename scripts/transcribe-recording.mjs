/**
 * Transcribe one track of a stored recording, off-platform, in chunks.
 *
 * WHY THIS EXISTS
 * A long track cannot be transcribed in one HTTP request. Two separate 300s
 * ceilings sit in the way and both were hit on Akio's 47-minute lesson with
 * Kazuyuki: Vercel's function limit (504 at 301s on Hobby), and — once the
 * plan was raised — Node's own undici client, whose default headersTimeout is
 * also 300s and which reports the abort as a bare "fetch failed". Raising the
 * platform limit does not move the second one.
 *
 * So the track is cut into chunks with ffmpeg and each chunk is transcribed on
 * its own. Every request is then short by construction, and the ceilings stop
 * mattering. Word timings from chunk N are shifted by that chunk's start so
 * the merged result is indistinguishable from one long transcription — which
 * matters, because the talk-time split and every speaking metric are computed
 * from those timings.
 *
 * ffmpeg is doing real work here, not just splitting bytes: WebM is a
 * container, and a naive byte-slice produces files Whisper cannot open.
 *
 * The output is otherwise identical to lib/whisper's transcribeOne — same
 * model, same parameters, same hallucination filter. If that file changes,
 * this one has to change with it.
 *
 * USAGE
 *   OPENAI_API_KEY=sk-… node scripts/transcribe-recording.mjs <recordingId> <mic|tab> [lang] [chunkMinutes]
 *
 * The key is read from the environment first and .env.local second, so it can
 * be passed for one command without being written to disk.
 */
import { readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function envFile() {
  const out = {}
  try {
    for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* no local env is fine if the process env has what we need */ }
  return out
}

// Mirrors keepConfidentWords in lib/whisper.ts — Whisper does not return
// nothing for silence, it invents fluent text, so untrusted segments go.
const NO_SPEECH_MAX = 0.6
const AVG_LOGPROB_MIN = -1.0
function keepConfidentWords(words, segments) {
  if (!segments.length) return words
  const trusted = segments.filter(
    (s) => (Number(s.no_speech_prob) || 0) < NO_SPEECH_MAX && (Number(s.avg_logprob) || 0) > AVG_LOGPROB_MIN,
  )
  if (!trusted.length) return []
  return words.filter((w) =>
    trusted.some((s) => w.start >= (Number(s.start) || 0) - 0.05 && w.start <= (Number(s.end) || 0) + 0.05),
  )
}

async function transcribeChunk(buf, name, openai, language) {
  const form = new FormData()
  form.append('file', new Blob([buf], { type: 'audio/webm' }), name)
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')
  if (language) form.append('language', language)

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openai}` },
    body: form,
  })
  if (!res.ok) throw new Error(`whisper failed (${res.status}): ${await res.text()}`)
  const json = await res.json()
  const raw = (Array.isArray(json.words) ? json.words : [])
    .map((w) => ({ text: String(w.word ?? w.text ?? '').trim(), start: Number(w.start) || 0, end: Number(w.end) || 0 }))
    .filter((w) => w.text)
  return keepConfidentWords(raw, Array.isArray(json.segments) ? json.segments : [])
}

async function main() {
  const [recordingId, track, language, chunkMinRaw] = process.argv.slice(2)
  if (!recordingId || !track) {
    console.error('usage: OPENAI_API_KEY=… node scripts/transcribe-recording.mjs <recordingId> <mic|tab> [lang] [chunkMinutes]')
    process.exit(1)
  }
  const chunkSec = Math.max(60, Math.round((Number(chunkMinRaw) || 10) * 60))

  const E = envFile()
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || E.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || E.SUPABASE_SERVICE_ROLE_KEY
  const openai = process.env.OPENAI_API_KEY || E.OPENAI_API_KEY
  for (const [n, v] of [['NEXT_PUBLIC_SUPABASE_URL', url], ['SUPABASE_SERVICE_ROLE_KEY', key], ['OPENAI_API_KEY', openai]]) {
    if (!v) { console.error(`Missing ${n}`); process.exit(1) }
  }

  const BUCKET = 'lesson-recordings'
  const store = (p) => `${url}/storage/v1/object/${BUCKET}/${p}`
  const auth = { apikey: key, Authorization: `Bearer ${key}` }

  const work = path.join(os.tmpdir(), `koku-rec-${recordingId.slice(0, 8)}-${track}`)
  if (existsSync(work)) rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })
  const src = path.join(work, 'src.webm')

  console.log(`↓ ${recordingId}/${track}.webm`)
  const audioRes = await fetch(store(`${recordingId}/${track}.webm`), { headers: auth })
  if (!audioRes.ok) { console.error(`download failed (${audioRes.status})`); process.exit(1) }
  const bytes = Buffer.from(await audioRes.arrayBuffer())
  const { writeFileSync } = await import('node:fs')
  writeFileSync(src, bytes)
  console.log(`  ${(bytes.length / 1024 / 1024).toFixed(1)}MB`)

  // Re-encode while segmenting: the source is a browser MediaRecorder stream
  // with no duration in its header, and copying it through unchanged carries
  // that defect into every chunk.
  console.log(`✂ splitting into ${chunkSec / 60}-minute chunks`)
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', src,
    '-f', 'segment', '-segment_time', String(chunkSec), '-reset_timestamps', '1',
    '-c:a', 'libopus', '-b:a', '32k', '-ac', '1',
    path.join(work, 'part%03d.webm'),
  ], { stdio: ['ignore', 'inherit', 'inherit'] })

  const { readdirSync } = await import('node:fs')
  const parts = readdirSync(work).filter((f) => /^part\d+\.webm$/.test(f)).sort()
  if (!parts.length) { console.error('ffmpeg produced no chunks'); process.exit(1) }
  console.log(`  ${parts.length} chunks`)

  const words = []
  for (let i = 0; i < parts.length; i++) {
    const buf = await readFile(path.join(work, parts[i]))
    const offset = i * chunkSec
    process.stdout.write(`→ chunk ${i + 1}/${parts.length} (${(buf.length / 1024 / 1024).toFixed(1)}MB, +${offset}s) `)
    const t0 = Date.now()
    const got = await transcribeChunk(buf, parts[i], openai, language)
    // Shift into the parent track's timeline, or every chunk would claim to
    // start at zero and the talk-time split would be nonsense.
    for (const w of got) words.push({ text: w.text, start: w.start + offset, end: w.end + offset })
    console.log(`${Math.round((Date.now() - t0) / 1000)}s, ${got.length} words`)
  }
  console.log(`  ${words.length} words total`)

  // Merge rather than replace — the other track may already be cached and paid for.
  let cache = { v: 1, language: language ?? null, createdAt: new Date().toISOString(), tracks: {} }
  const existing = await fetch(store(`${recordingId}/transcript.json`), { headers: auth })
  if (existing.ok) {
    try {
      const parsed = JSON.parse(await existing.text())
      if (parsed?.v === 1 && parsed.tracks) cache = parsed
    } catch { /* unreadable cache is the same as none */ }
  }
  cache.tracks[track] = words
  cache.language = language ?? cache.language ?? null

  const put = await fetch(store(`${recordingId}/transcript.json`), {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(cache),
  })
  if (!put.ok) { console.error(`could not save transcript (${put.status}): ${await put.text()}`); process.exit(1) }

  rmSync(work, { recursive: true, force: true })
  console.log(`✓ cached tracks: ${Object.keys(cache.tracks).join(', ')}`)
  console.log('Now POST /api/admin/recover-recording once more to write the recap.')
}

main().catch((e) => { console.error(e); process.exit(1) })
