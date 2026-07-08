'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Runs once when the teacher opens the overview: schedules recorder bots for any
 * upcoming lessons already on the calendar (no waiting for the daily cron), and
 * refreshes finished-recording statuses, then re-reads the page so newly-ready
 * recordings and scheduled bots show up.
 */
export default function OverviewSync() {
  const router = useRouter()
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // 1. Schedule bots for upcoming lessons already on the calendar.
        await fetch('/api/recall/ensure-scheduled', { method: 'POST' }).catch(() => {})
        // 2. Refresh recording statuses so finished calls are marked done.
        await fetch('/api/recall/status', { cache: 'no-store' }).catch(() => {})
        // 3. Auto-build recaps for finished recordings → they appear in
        //    "Recaps to review" without a manual Build step.
        await fetch('/api/recap/build-pending', { method: 'POST' }).catch(() => {})
      } finally {
        if (!cancelled) router.refresh()
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
