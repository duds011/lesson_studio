'use client'

import { TOUR_EVENT } from '@/components/GuidedTour'
import { useT } from '@/components/I18nProvider'

/**
 * Replays the guided tour. Just an event: the tour itself is mounted with the
 * nav on every teacher page, so it starts right here rather than bouncing the
 * teacher to the overview first.
 */
export default function ReplayTourButton() {
  const t = useT()
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
    >
      {t.tour.replay}
    </button>
  )
}
