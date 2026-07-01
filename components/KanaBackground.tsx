'use client'

import { useEffect, useRef } from 'react'

// Floating kana background — the GENOA Library signature.
export default function KanaBackground() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const chars = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん日本語学校先生友楽'.split('')
    const COUNT = 28
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement('span')
      s.className = 'kana'
      s.textContent = chars[Math.floor(Math.random() * chars.length)]
      s.style.left = Math.floor(Math.random() * 100) + 'vw'
      s.style.setProperty('--x', Math.random() * 40 - 20 + 'px')
      s.style.setProperty('--drift', Math.random() * 80 - 40 + 'px')
      s.style.setProperty('--o', (0.08 + Math.random() * 0.16).toFixed(2))
      s.style.setProperty('--s', 14 + Math.random() * 34 + 'px')
      const d = 12 + Math.random() * 16
      s.style.setProperty('--d', d + 's')
      s.style.setProperty('--delay', (Math.random() * -d).toFixed(2) + 's')
      root.appendChild(s)
    }
    return () => { root.innerHTML = '' }
  }, [])
  return <div ref={ref} className="kana-field" aria-hidden="true" />
}
