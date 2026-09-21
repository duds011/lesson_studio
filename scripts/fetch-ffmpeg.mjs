/**
 * Make sure the ffmpeg binary is actually on disk after an install.
 *
 * ffmpeg-static ships as a downloader, not a binary: its own `install` script
 * fetches the ~78MB executable for the platform. npm 11 does not run a
 * dependency's install script unless it has been approved, and on the build
 * machine it is not — the deploy log says so in a warning nobody reads, and
 * the failure only shows up much later as
 * `spawn .../ffmpeg ENOENT` inside a route.
 *
 * A root package's own postinstall IS run, so this is where that gap gets
 * closed. It exits 0 whatever happens: the binary is needed by one route that
 * cuts audio clips, and a build must not fail because a nicety could not be
 * downloaded.
 */
import { existsSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

const require = createRequire(import.meta.url)

let target
try {
  target = require('ffmpeg-static')
} catch {
  process.exit(0) // not installed here at all — nothing to do
}

// A few hundred bytes means the placeholder, not the program.
if (target && existsSync(target) && statSync(target).size > 1_000_000) {
  process.exit(0)
}

try {
  const installer = require.resolve('ffmpeg-static/install.js')
  execFileSync(process.execPath, [installer], { stdio: 'inherit' })
} catch (e) {
  console.warn('[fetch-ffmpeg] could not fetch ffmpeg:', e?.message || e)
}
process.exit(0)
