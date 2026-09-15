'use client'

import { ThinkingOrb, type OrbState, type OrbSize } from 'thinking-orbs'

/**
 * The one place an AI wait is drawn.
 *
 * Every long wait in the portal is the same kind of wait — a model chewing on
 * a lesson — so they all get the same mark, and the state says which part of
 * the pipeline is running: `listening` while audio is being transcribed,
 * `solving` while something is being written out of it. A spinner says only
 * "wait"; this says "wait, and here is what for".
 *
 * Route waits (a teacher tab rendering on the server) use the same object with
 * the plain `working` state. They are not a model thinking, so they get no
 * named stage — but they are a wait, and the app should only have one way of
 * saying that.
 *
 * Three things are deliberate:
 *
 * - The label sits beside the orb as plain type, not in a chip. It replaced a
 *   `.pill`, and a status that is already marked by a moving object does not
 *   also need a border drawn round it.
 * - The two sizes lay out differently, because the library ships them as two
 *   separate designs rather than one scaled twice: at 20 the orb is a piece of
 *   text and the label runs beside it; at 64 it is the subject of the area it
 *   sits in, so the label goes underneath and the whole block centres.
 * - `theme` is pinned rather than left on `auto`. Auto falls back to the OS
 *   `prefers-color-scheme`, and this portal has no dark mode — so a teacher
 *   with dark mode switched on would have got pale ink painted onto a white
 *   card and seen nothing at all. `onSolid` is the only reason to flip it:
 *   inside a filled brand button the ink has to go the other way.
 */
export default function Thinking({
  state = 'working',
  label,
  size = 20,
  onSolid = false,
}: {
  state?: OrbState
  /** Shown beside (20) or beneath (64) the orb as plain type. Also the accessible name. */
  label?: string
  /** 20 is text scale, 64 is the standalone/panel scale. Only these two are tuned. */
  size?: OrbSize
  /** True on a filled brand surface (btn-primary, k-modal-cta), where ink flips to light. */
  onSolid?: boolean
}) {
  const stacked = size === 64
  return (
    <span
      style={{
        display: stacked ? 'flex' : 'inline-flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: 'center',
        gap: label ? (stacked ? 14 : 8) : 0,
        verticalAlign: stacked ? undefined : 'middle',
      }}
    >
      <ThinkingOrb
        state={state}
        size={size}
        theme={onSolid ? 'dark' : 'light'}
        aria-label={label || 'Working'}
        style={{ display: 'block', flex: '0 0 auto' }}
      />
      {label && <span style={stacked ? { color: 'var(--muted)', fontSize: 13 } : undefined}>{label}</span>}
    </span>
  )
}
