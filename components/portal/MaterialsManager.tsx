'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  addMaterial, addMaterialsBulk, deleteMaterial, updateMaterial, type Material,
} from '@/app/actions/materials'

const ICON: Record<string, string> = { video: '▶', article: '📄', link: '🔗' }

/** The library itself: paste a link, get a card. */
export default function MaterialsManager({ initial }: { initial: Material[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [url, setUrl] = useState('')
  const [bulk, setBulk] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')

  const materials = initial.filter((m) => {
    const t = q.trim().toLowerCase()
    if (!t) return true
    return `${m.title} ${m.site ?? ''} ${m.note ?? ''}`.toLowerCase().includes(t)
  })

  const add = () => {
    if (!url.trim()) return
    setError(''); setMsg('')
    startTransition(async () => {
      const res = await addMaterial(url)
      if (!res.success) { setError(res.error || 'Could not save that link'); return }
      setUrl(''); setMsg('Saved')
      router.refresh()
    })
  }

  const addMany = () => {
    if (!bulk.trim()) return
    setError(''); setMsg('')
    startTransition(async () => {
      const res = await addMaterialsBulk(bulk)
      if (!res.success) { setError(res.error || 'Could not save those links'); return }
      setBulk(''); setBulkOpen(false)
      setMsg(`Added ${res.added}${res.failed ? ` · ${res.failed} could not be read` : ''}`)
      router.refresh()
    })
  }

  const saveTitle = (id: string) => {
    startTransition(async () => {
      await updateMaterial(id, { title: draftTitle })
      setEditing(null)
      router.refresh()
    })
  }

  const remove = (m: Material) => {
    if (!confirm(`Remove "${m.title}" from your library? Lessons you already shared it on keep it.`)) return
    startTransition(async () => {
      await deleteMaterial(m.id)
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon" aria-hidden>🔗</span>
          <div>
            <h3>Add a link</h3>
            <p className="desc">
              A YouTube video, an article, a worksheet on another site. Paste the address — the
              title and picture are filled in for you.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="k-input"
            style={{ flex: '1 1 320px' }}
            placeholder="https://youtube.com/watch?v=…"
            value={url}
            disabled={pending}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add() }}
          />
          <button className="btn btn-primary" disabled={pending || !url.trim()} onClick={add}>
            {pending ? 'Reading…' : 'Save to library'}
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 10 }}
          onClick={() => setBulkOpen((v) => !v)}
        >
          {bulkOpen ? 'Never mind' : 'Paste a whole list instead'}
        </button>

        {bulkOpen && (
          <div style={{ marginTop: 10 }}>
            <textarea
              className="k-input"
              rows={5}
              placeholder={'One per line, or separated by spaces — up to 40 at a time.'}
              value={bulk}
              disabled={pending}
              onChange={(e) => setBulk(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} disabled={pending || !bulk.trim()} onClick={addMany}>
              {pending ? 'Reading them…' : 'Add them all'}
            </button>
          </div>
        )}

        {(msg || error) && (
          <p style={{ fontSize: 12.5, marginTop: 10, marginBottom: 0, fontWeight: 600, color: error ? 'var(--red)' : 'var(--brand)' }}>
            {error || msg}
          </p>
        )}
      </section>

      <section className="k-sec">
        <div className="k-sec-head">
          <span className="k-sec-icon b" aria-hidden>📚</span>
          <div>
            <h3>Your library</h3>
            <p className="desc">
              {initial.length === 0
                ? 'Nothing saved yet. Anything you add here can be attached to a recap in two clicks.'
                : `${initial.length} material${initial.length === 1 ? '' : 's'}, most recently used first.`}
            </p>
          </div>
        </div>

        {initial.length > 0 && (
          <input
            className="k-input"
            placeholder="Search your library…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ marginBottom: 12, maxWidth: 320 }}
          />
        )}

        <div className="k-mat-grid">
          {materials.map((m) => (
            <article key={m.id} className="k-mat">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="k-mat-thumb" aria-label={m.title}>
                {m.thumbnail
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={m.thumbnail} alt="" loading="lazy" />
                  : <span aria-hidden>{ICON[m.kind] ?? '🔗'}</span>}
              </a>
              <div className="k-mat-body">
                {editing === m.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="k-input"
                      value={draftTitle}
                      autoFocus
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(m.id); if (e.key === 'Escape') setEditing(null) }}
                      style={{ fontSize: 12.5, padding: '6px 9px' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => saveTitle(m.id)}>Save</button>
                  </div>
                ) : (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="k-mat-title">{m.title}</a>
                )}
                <div className="k-mat-meta">
                  <span>{m.site ?? new URL(m.url).hostname}</span>
                  {m.use_count > 0 && <span>· used {m.use_count}×</span>}
                </div>
                <div className="k-mat-acts">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(m.id); setDraftTitle(m.title) }}>Rename</button>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => remove(m)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {initial.length > 0 && materials.length === 0 && (
          <p className="desc" style={{ margin: 0 }}>Nothing matches “{q}”.</p>
        )}
      </section>
    </div>
  )
}
