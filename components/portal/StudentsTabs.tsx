'use client'

import { useState } from 'react'

/**
 * Two views of the same roster: the list you act on, and the picture across
 * everyone.
 *
 * The list stays the landing view — it is what a teacher opens this page to
 * do. Analytics is a step sideways, not the front door, so it is a tab rather
 * than a second page: the numbers only mean anything next to the names they
 * came from.
 *
 * The analytics panel is mounted only while it is showing. Its charts size
 * themselves from their container on mount, and a container inside a hidden
 * element measures zero — mounting it up front and revealing it later is how
 * you get an axis with nothing drawn against it.
 */
export default function StudentsTabs({
  list,
  analytics,
  studentCount,
}: {
  list: React.ReactNode
  analytics: React.ReactNode
  studentCount: number
}) {
  const [tab, setTab] = useState<'list' | 'analytics'>('list')

  // Nothing to compare across one student, and nothing at all across none.
  const canCompare = studentCount > 1

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="k-tabs" role="tablist" aria-label="Students view">
        <button
          role="tab"
          aria-selected={tab === 'list'}
          className={`k-tab ${tab === 'list' ? 'sel' : ''}`}
          onClick={() => setTab('list')}
        >
          Students
        </button>
        <button
          role="tab"
          aria-selected={tab === 'analytics'}
          className={`k-tab ${tab === 'analytics' ? 'sel' : ''}`}
          onClick={() => setTab('analytics')}
          disabled={!canCompare}
          title={canCompare ? undefined : 'Add a second student to compare'}
        >
          Analytics
        </button>
      </div>

      <div hidden={tab !== 'list'}>{list}</div>
      {tab === 'analytics' && <div>{analytics}</div>}
    </div>
  )
}
