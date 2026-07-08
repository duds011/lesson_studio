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
        await fetch('/api/recall/ensure-scheduled', { method: 'POST' }).catch(() => {})
        await fetch('/api/recall/status', { cache: 'no-store' }).catch(() => {})
      } finally {
        if (!cancelled) router.refresh()
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
