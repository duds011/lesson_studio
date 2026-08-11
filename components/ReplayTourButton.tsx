'use client'

import { TOUR_EVENT } from '@/components/GuidedTour'

/**
 * Replays the guided tour. Just an event: the tour itself is mounted with the
 * nav on every teacher page, so it starts right here rather than bouncing the
 * teacher to the overview first.
 */
export default function ReplayTourButton() {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
    >
      ✨ Show me around again
    </button>
  )
}
