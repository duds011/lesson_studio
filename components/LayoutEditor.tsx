'use client'

import { useState } from 'react'
import { BLOCK_LABELS, type BlockId, type Layout } from '@/lib/brand'

/**
 * Drag blocks between the wide column and the side rail, and reorder within
 * each. Uses native HTML5 drag events — no dependency — and keeps keyboard
 * arrows working, since drag-and-drop alone is unusable without a mouse.
 */

type Col = 'main' | 'rail'
type Dragging = { col: Col; index: number } | null

export default function LayoutEditor({
  layout,
  hidden,
  onChange,
}: {
  layout: Layout
  /** Blocks switched off in the Sections panel — shown greyed, still movable. */
  hidden: Set<BlockId>
  onChange: (next: Layout) => void
}) {
  const [dragging, setDragging] = useState<Dragging>(null)
  const [over, setOver] = useState<{ col: Col; index: number } | null>(null)

  /** Move a block from one position to another, across columns if needed. */
  const move = (from: { col: Col; index: number }, to: { col: Col; index: number }) => {
    const next: Layout = { main: [...layout.main], rail: [...layout.rail] }
    const [block] = next[from.col].splice(from.index, 1)
    if (!block) return
    // Removing from an earlier slot in the same column shifts the target left.
    const target = from.col === to.col && from.index < to.index ? to.index - 1 : to.index
    next[to.col].splice(Math.max(0, Math.min(next[to.col].length, target)), 0, block)
    onChange(next)
  }

  const nudge = (col: Col, index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= layout[col].length) {
      // Past either end, hop to the other column.
      const other: Col = col === 'main' ? 'rail' : 'main'
      move({ col, index }, { col: other, index: delta > 0 ? 0 : layout[other].length })
      return
    }
    move({ col, index }, { col, index: delta > 0 ? target + 1 : target })
  }

  const column = (col: Col, title: string, hint: string) => (
    <div
      className="k-layout-col"
      onDragOver={(e) => { e.preventDefault(); if (!layout[col].length) setOver({ col, index: 0 }) }}
      onDrop={(e) => {
        e.preventDefault()
        if (dragging) move(dragging, over?.col === col ? over : { col, index: layout[col].length })
        setDragging(null); setOver(null)
      }}
    >
      <div className="k-layout-head">
        <strong>{title}</strong>
        <small>{hint}</small>
      </div>

      <div className="k-layout-list">
        {layout[col].map((id, i) => (
          <div
            key={id}
            draggable
            className={[
              'k-block',
              hidden.has(id) ? 'off' : '',
              dragging?.col === col && dragging.index === i ? 'dragging' : '',
              over?.col === col && over.index === i ? 'over' : '',
            ].join(' ')}
            onDragStart={() => setDragging({ col, index: i })}
            onDragEnd={() => { setDragging(null); setOver(null) }}
            onDragOver={(e) => { e.preventDefault(); setOver({ col, index: i }) }}
          >
            <span className="k-block-grip" aria-hidden>⠿</span>
            <span className="k-block-name">{BLOCK_LABELS[id]}</span>
            {hidden.has(id) && <span className="k-block-off">hidden</span>}
            <span className="k-block-move">
              <button type="button" aria-label={`Move ${BLOCK_LABELS[id]} up`} onClick={() => nudge(col, i, -1)}>↑</button>
              <button type="button" aria-label={`Move ${BLOCK_LABELS[id]} down`} onClick={() => nudge(col, i, 1)}>↓</button>
            </span>
          </div>
        ))}

        {layout[col].length === 0 && <div className="k-layout-empty">Drop a block here</div>}
      </div>
    </div>
  )

  return (
    <div className="k-layout-grid">
      {column('main', 'Main column', 'The wide area')}
      {column('rail', 'Side rail', 'Narrow, beside it')}
    </div>
  )
}
