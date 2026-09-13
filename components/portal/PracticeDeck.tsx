'use client'

import { useCallback, useState } from 'react'

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
 * Practice, one short round at a time.
 *
 * The deck arrives whole and ordered (due first, least-known first) but is
 * handed out in rounds of SESSION_SIZE. A student a term in has a hundred-odd
 * words, and a hundred-card queue is a wall rather than an invitation — they
 * start, flag around thirty, and stop coming back. This way every sitting has
 * an end in sight and the next round is a button, not the only way out.
 *
 * Rounds slice the ordered deck rather than re-querying, so a word answered in
 * round one cannot reappear in round two: the server's ordering is a snapshot
 * taken before any of today's answers landed, and a card missed just now is
 * due again immediately.
 *
 * Inside a round: the word, then its meaning, then an honest answer. "Again"
 * puts the card back a few places rather than at the end, so a word you just
 * missed comes round while you still remember missing it — and the round cannot
 * be finished by clicking past everything you got wrong.
 *
 * Answers are sent as they happen and the session keeps going regardless: a
 * dropped request costs one card's progress, and stopping the student mid-round
 * to tell them so would cost more.
 */
export default function PracticeDeck({
  cards, title, dueCount, sessionSize = 12,
}: {
  cards: Card[]
  title: string
  /** How many of the deck are actually due today. */
  dueCount: number
  sessionSize?: number
}) {
  /** Which round we are on; round n is cards[n*size … (n+1)*size). */
  const [round, setRound] = useState(0)
  const roundCards = cards.slice(round * sessionSize, (round + 1) * sessionSize)

  const [queue, setQueue] = useState<Card[]>(roundCards)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [missed, setMissed] = useState(0)

  const record = useCallback((id: string, knew: boolean) => {
    // Deliberately not awaited: the next card should not wait on a round trip.
    fetch('/api/portal/flashcard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vocabularyItemId: id, knew }),
    }).catch(() => {})
  }, [])

  const startRound = (n: number) => {
    setRound(n)
    setQueue(cards.slice(n * sessionSize, (n + 1) * sessionSize))
    setDone(0)
    setMissed(0)
    setFlipped(false)
  }

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

  // ── the end of a round ──
  if (queue.length === 0) {
    const size = roundCards.length
    const left = Math.max(0, cards.length - (round + 1) * sessionSize)
    const nextSize = Math.min(sessionSize, left)
    return (
      <div className="k-card k-prac-empty">
        <span className="k-prac-tick" aria-hidden>✓</span>
        <h2>Done — {size} card{size === 1 ? '' : 's'}.</h2>
        <p className="analytics-note">
          {missed === 0
            ? 'Every one first time. They will come back in a few days.'
            : `${size - missed} first time, ${missed} to see again sooner.`}
        </p>

        {/* Stopping here is the expected thing, so this reads as finished
            whether or not there is more left. The next round is an offer. */}
        <p className="k-prac-left">
          {left > 0
            ? `${left} more word${left === 1 ? '' : 's'} in this deck, whenever you like.`
            : 'That is the whole deck.'}
        </p>

        <div className="k-prac-acts">
          {left > 0 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => startRound(round + 1)}>
              {nextSize} more
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => startRound(0)}>
              Start again
            </button>
          )}
          <a className={`btn btn-sm ${left > 0 ? 'btn-ghost' : 'btn-primary'}`} href="/student/dashboard">
            Back to dashboard
          </a>
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
          {/* What this sitting is, not how big the pile is. Deliberately no
              "round 3 of 9": naming the total rounds re-hangs the whole deck
              over a student who has just sat down for two minutes. How much is
              left is said once, at the end, when stopping is the other
              option. */}
          <p className="k-prac-sub">
            {dueCount > 0
              ? `${dueCount} due · ${roundCards.length} this round`
              : `nothing due — ${roundCards.length} to keep sharp`}
          </p>
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
