'use client'

import { useCallback, useMemo, useState } from 'react'

export type Card = {
  id: string
  word: string
  reading?: string | null
  definition?: string | null
  example?: string | null
  level?: string | null
  pos?: string | null
  lesson?: number | null
  box: number
  due: boolean
}

const POS_LABEL: Record<string, string> = {
  noun: 'Noun', verb: 'Verb', adjective: 'Adjective',
  adverb: 'Adverb', phrase: 'Phrase', other: 'Word',
}

/**
 * One practice session.
 *
 * The word, then its meaning, then an honest answer about whether you knew it.
 * "Again" puts the card back a few places rather than at the very end, so a
 * word you just missed comes round while you still remember missing it — and
 * the round cannot be finished by clicking past everything you got wrong.
 *
 * Answers are sent as they happen and the session keeps going regardless: a
 * dropped request costs one card's progress, and stopping the student mid-deck
 * to tell them so would cost more.
 */
export default function PracticeDeck({
  cards, title, subtitle,
}: {
  cards: Card[]
  title: string
  subtitle: string
}) {
  const [queue, setQueue] = useState<Card[]>(cards)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [missed, setMissed] = useState(0)
  const startedWith = useMemo(() => cards.length, [cards.length])

  const record = useCallback((id: string, knew: boolean) => {
    // Deliberately not awaited: the next card should not wait on a round trip.
    fetch('/api/portal/flashcard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vocabularyItemId: id, knew }),
    }).catch(() => {})
  }, [])

  if (cards.length === 0) {
    return (
      <div className="k-card k-prac-empty">
        <h2>Nothing to practise yet</h2>
        <p className="analytics-note">
          Words appear here once your teacher publishes a lesson recap.
        </p>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="k-card k-prac-empty">
        <span className="k-prac-tick" aria-hidden>✓</span>
        <h2>Done — {startedWith} card{startedWith === 1 ? '' : 's'}.</h2>
        <p className="analytics-note">
          {missed === 0
            ? 'Every one first time. They will come back in a few days.'
            : `${startedWith - missed} first time, ${missed} to see again sooner.`}
        </p>
        <div className="k-prac-acts">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setQueue(cards); setDone(0); setMissed(0); setFlipped(false) }}>
            Go again
          </button>
          <a className="btn btn-primary btn-sm" href="/student/dashboard">Back to dashboard</a>
        </div>
      </div>
    )
  }

  const card = queue[0]
  const answer = (knew: boolean) => {
    record(card.id, knew)
    setFlipped(false)
    setDone((n) => n + 1)
    if (knew) {
      setQueue((q) => q.slice(1))
    } else {
      setMissed((n) => n + 1)
      // Back a few places, not to the end.
      setQueue((q) => {
        const [head, ...rest] = q
        const at = Math.min(4, rest.length)
        return [...rest.slice(0, at), head, ...rest.slice(at)]
      })
    }
  }

  const pct = Math.round((done / (done + queue.length)) * 100)

  return (
    <div className="k-prac">
      <div className="k-prac-top">
        <div>
          <h1 className="k-prac-title">{title}</h1>
          <p className="k-prac-sub">{subtitle}</p>
        </div>
        <span className="k-prac-count">{done + 1} / {done + queue.length}</span>
      </div>
      <div className="k-prac-bar"><i style={{ width: `${pct}%` }} /></div>

      <button
        type="button"
        className={`k-prac-card${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-expanded={flipped}
      >
        {card.pos && <span className="k-prac-pos">{POS_LABEL[card.pos] ?? 'Word'}</span>}
        {card.level && <span className="k-prac-lvl">{card.level}</span>}

        <span className="k-prac-word">{card.word}</span>
        {flipped && card.reading && <span className="k-prac-reading">{card.reading}</span>}

        {flipped ? (
          <>
            {card.definition && <span className="k-prac-def">{card.definition}</span>}
            {card.example && <span className="k-prac-eg">“{card.example}”</span>}
            {card.lesson != null && <span className="k-prac-from">Lesson {card.lesson}</span>}
          </>
        ) : (
          <span className="k-prac-tap">Tap to see the meaning</span>
        )}
      </button>

      {flipped ? (
        <div className="k-prac-acts">
          <button type="button" className="k-prac-act again" onClick={() => answer(false)}>Again</button>
          <button type="button" className="k-prac-act knew" onClick={() => answer(true)}>Knew it</button>
        </div>
      ) : (
        <p className="k-prac-hint">Say it out loud before you flip it.</p>
      )}
    </div>
  )
}
