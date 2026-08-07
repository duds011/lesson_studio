'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Grab-and-drag horizontal panning for anything too wide for its column.
 *
 * Ported from GENOA's attachHorizontalScroller, with one deliberate omission:
 * that version also turns a vertical wheel into horizontal scroll. It works
 * there because it wraps a short chips rail, but on a full-width table it traps
 * the page — you put the pointer over the table, scroll, and the document stops
 * moving. Wheel is left alone here; dragging is the addition.
 *
 * The click suppression is not optional. Payment rows are buttons that open the
 * edit modal, so without it every drag that happens to start on a row also
 * fires that row's click and the modal appears the moment you let go.
 */
export default function DragScroller({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [canDrag, setCanDrag] = useState(false)

  // Only offer the grab cursor when there is actually something to pan to.
  // Re-measured on resize, since the table's overflow depends on the viewport.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setCanDrag(el.scrollWidth > el.clientWidth + 2)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children])

  const state = useRef({ startX: 0, startLeft: 0, moved: false })

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.button !== 0 || el.scrollWidth <= el.clientWidth + 2) return
    state.current = { startX: e.clientX, startLeft: el.scrollLeft, moved: false }
    setDragging(true)
    // Throws if the pointer id is no longer active — a stale capture must not
    // take the whole drag down with it.
    try { el.setPointerCapture?.(e.pointerId) } catch { /* nothing to capture */ }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || !dragging) return
    const delta = e.clientX - state.current.startX
    // A few pixels of slack, so a click with a shaky hand is still a click.
    if (Math.abs(delta) > 4) state.current.moved = true
    if (state.current.moved) el.scrollLeft = state.current.startLeft - delta
  }, [dragging])

  const stop = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDragging(false)
    try { ref.current?.releasePointerCapture?.(e.pointerId) } catch { /* already released */ }
  }, [dragging])

  // Capture phase: this has to run before the row's own handler.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (!state.current.moved) return
    e.preventDefault()
    e.stopPropagation()
    state.current.moved = false
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onClickCapture={onClickCapture}
      style={{
        overflowX: 'auto',
        cursor: dragging ? 'grabbing' : canDrag ? 'grab' : undefined,
        // Let the browser own vertical panning; we only take over horizontal,
        // so touch scrolling down the page keeps working over the table.
        touchAction: 'pan-y',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
