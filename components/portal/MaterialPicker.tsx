'use client'

import { useEffect, useState } from 'react'
import { listMaterials, type Material } from '@/app/actions/materials'

const ICON: Record<string, string> = { video: '▶', article: '📄', link: '🔗' }

/**
 * "Add from library" while reviewing a recap.
 *
 * The library is loaded when the drawer is opened rather than with the page:
 * most reviews never touch it, and a teacher with two hundred materials should
 * not pay for them on every recap.
 *
 * Chosen materials are held, not attached — the lesson row does not exist
 * until the recap is approved. Same shape as the voice memo and the pending
 * files beside it; the parent attaches them once publishing has made a lesson.
 */
export default function MaterialPicker({ onChange }: { onChange: (picked: Material[]) => void }) {
  const [open, setOpen] = useState(false)
  const [all, setAll] = useState<Material[] | null>(null)
  const [picked, setPicked] = useState<Material[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open || all) return
    listMaterials().then(setAll).catch(() => setAll([]))
  }, [open, all])

  const toggle = (m: Material) => {
    const next = picked.some((p) => p.id === m.id)
      ? picked.filter((p) => p.id !== m.id)
      : [...picked, m]
    setPicked(next)
    onChange(next)
  }

  const shown = (all ?? []).filter((m) => {
    const t = q.trim().toLowerCase()
    return !t || `${m.title} ${m.site ?? ''}`.toLowerCase().includes(t)
  })

  return (
    <div className="k-pick">
      <div className="k-pick-bar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close library' : '📚 Add from library'}
        </button>
        {picked.length > 0 && (
          <span className="k-pick-count">{picked.length} attached</span>
        )}
      </div>

      {picked.length > 0 && (
        <ul className="k-pick-chosen">
          {picked.map((m) => (
            <li key={m.id}>
              <span aria-hidden>{ICON[m.kind] ?? '🔗'}</span>
              <span className="k-pick-name">{m.title}</span>
              <button type="button" onClick={() => toggle(m)} aria-label={`Remove ${m.title}`}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="k-pick-panel">
          {all === null && <p className="desc" style={{ margin: 0 }}>Loading your library…</p>}

          {all !== null && all.length === 0 && (
            <p className="desc" style={{ margin: 0 }}>
              Your library is empty. Save videos and articles under{' '}
              <a href="/teacher/materials" style={{ color: 'var(--brand)', fontWeight: 700 }}>Materials</a>{' '}
              and they will be here next time.
            </p>
          )}

          {all !== null && all.length > 0 && (
            <>
              <input
                className="k-input"
                placeholder="Search materials…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <ul className="k-pick-list">
                {shown.map((m) => {
                  const on = picked.some((p) => p.id === m.id)
                  return (
                    <li key={m.id}>
                      <button type="button" className={`k-pick-row${on ? ' on' : ''}`} onClick={() => toggle(m)}>
                        <span className="k-pick-ic" aria-hidden>{ICON[m.kind] ?? '🔗'}</span>
                        <span style={{ minWidth: 0 }}>
                          <span className="k-pick-name">{m.title}</span>
                          <small>{m.site ?? ''}</small>
                        </span>
                        <span className="k-pick-tick" aria-hidden>{on ? '✓' : '+'}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {shown.length === 0 && <p className="desc" style={{ margin: 0 }}>Nothing matches “{q}”.</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
