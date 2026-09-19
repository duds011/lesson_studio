'use client'

import { useT } from '@/components/I18nProvider'
import { fill } from '@/lib/i18n'
import { useCallback, useState } from 'react'
import { MASTERY_META, SESSION_SIZES, sessionLabel, type Mastery } from '@/lib/flashcards'

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

/** Where this pile stands: three bands on one bar, counts underneath. */
function MasteryBar({ mastery, total }: { mastery: Record<Mastery, number>; total: number }) {
  const order: Mastery[] = ['known', 'learning', 'new']
  if (total === 0) return null
  return (
    <div className="k-mastery">
      <div className="k-mastery-bar">
        {order.map((k) =>
          mastery[k] > 0 ? (
            <i
              key={k}
              style={{ width: `${(mastery[k] / total) * 100}%`, background: MASTERY_META[k].tone }}
              title={`${mastery[k]} ${MASTERY_META[k].label.toLowerCase()}`}
            />
          ) : null,
        )}
      </div>
      <div className="k-mastery-key">
        {order.map((k) => (
          <span key={k}>
            <b style={{ background: MASTERY_META[k].tone }} />
            {mastery[k]} {MASTERY_META[k].label.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Practice, one round at a time, at a length the student picks.
 *
 * The deck arrives whole and ordered (due first, least-known first) and is
 * handed out in rounds. A hundred-card queue is a wall rather than an
 * invitation — people start, flag around thirty, and stop coming back — so
 * every sitting has an end in sight and the next round is a button.
 *
 * Twelve is the default because it is the one most people finish, but it is a
 * floor rather than a cage: someone revising for Friday can take the lot.
 *
 * Rounds slice the ordered snapshot rather than re-querying, so a word answered
 * in round one cannot reappear in round two — the ordering was taken before
 * any of today's answers landed, and a card just missed is due immediately.
 *
 * Inside a round: the word, then its meaning, then an honest answer. "Again"
 * puts the card back a few places rather than at the end, so a word you just
 * missed comes round while you still remember missing it — and the round cannot
 * be finished by clicking past everything you got wrong.
 */
export default function PracticeDeck({
  cards, title, dueCount, mastery, sessionSize = 12, deck, lessonId,
}: {
  cards: Card[]
  title: string
  /** How many of this selection are actually due today. */
  dueCount: number
  mastery: Record<Mastery, number>
  sessionSize?: number
  deck?: string | null
  lessonId?: string | null
}) {
  const t = useT()
  /** null until they choose a length — the start screen. */
  const [size, setSize] = useState<number | null>(null)
  const [round, setRound] = useState(0)
  const [queue, setQueue] = useState<Card[]>([])
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [missed, setMissed] = useState(0)

  const step = size === 0 ? cards.length : (size ?? sessionSize)
  const roundCards = cards.slice(round * step, (round + 1) * step)

  const record = useCallback((id: string, knew: boolean) => {
    // Not awaited: the next card should not wait on a round trip. But
    // `keepalive` matters — without it the browser cancels the request when the
    // page navigates, so the last card answered before pressing Back was never
    // recorded and the counts came back looking like the round had not happened.
    fetch('/api/portal/flashcard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vocabularyItemId: id, knew }),
      keepalive: true,
    }).catch(() => {})
  }, [])

  /** Logged once, when a round is finished — see the session route. */
  const logRound = useCallback((n: number, right: number) => {
    fetch('/api/portal/flashcard/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: n, correct: right, deck: deck ?? null, lessonId: lessonId ?? null }),
      keepalive: true,
    }).catch(() => {})
  }, [deck, lessonId])

  const startRound = (n: number, chosen = step) => {
    setRound(n)
    setQueue(cards.slice(n * chosen, (n + 1) * chosen))
    setDone(0)
    setMissed(0)
    setFlipped(false)
  }

  if (cards.length === 0) {
    return (
      <div className="k-card k-prac-empty">
        <h2>{t.practice.emptyTitle}</h2>
        <p className="analytics-note">{t.practice.emptyBody}</p>
      </div>
    )
  }

  // ── the start screen: what this pile is, and how much of it to do ──
  if (size === null) {
    const choices = SESSION_SIZES.filter((n) => n === 0 || n < cards.length)
    return (
      <div className="k-prac">
        <div className="k-prac-top">
          <div>
            <h1 className="k-prac-title">{title}</h1>
            <p className="k-prac-sub">
              {dueCount > 0
                ? `${dueCount} due of ${cards.length}`
                : `nothing due — ${cards.length} word${cards.length === 1 ? '' : 's'} resting`}
            </p>
          </div>
        </div>

        <div className="k-card" style={{ marginTop: 14 }}>
          <MasteryBar mastery={mastery} total={cards.length} />

          <p className="k-prac-ask">{t.practice.howMany}</p>
          <div className="k-prac-sizes">
            {choices.map((n) => (
              <button
                key={n}
                type="button"
                className="k-prac-size"
                onClick={() => {
                  const chosen = n === 0 ? cards.length : n
                  setSize(n)
                  startRound(0, chosen)
                }}
              >
                <b>{sessionLabel(n)}</b>
                <span>{n === 0 ? `all ${cards.length}` : n === 12 ? 'about two minutes' : 'a longer sitting'}</span>
              </button>
            ))}
            {choices.length === 0 && (
              <button
                type="button"
                className="k-prac-size"
                onClick={() => { setSize(0); startRound(0, cards.length) }}
              >
                <b>{cards.length}</b>
                <span>everything you have</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── the end of a round ──
  if (queue.length === 0) {
    const size_ = roundCards.length
    const left = Math.max(0, cards.length - (round + 1) * step)
    const nextSize = Math.min(step, left)
    return (
      <div className="k-card k-prac-empty">
        <span className="k-prac-tick" aria-hidden>✓</span>
        <h2>{size_ === 1 ? t.practice.doneOneTitle : fill(t.practice.doneTitle, { n: size_ })}</h2>
        <p className="analytics-note">
          {missed === 0
            ? t.practice.allFirstTime
            : fill(t.practice.someMissed, { right: size_ - missed, missed })}
        </p>

        {/* Stopping here is the expected thing, so this reads as finished
            whether or not there is more left. The next round is an offer. */}
        <p className="k-prac-left">
          {left > 0
            ? (left === 1 ? t.practice.oneLeft : fill(t.practice.moreLeft, { n: left }))
            : t.practice.wholePile}
        </p>

        <div className="k-prac-acts">
          {left > 0 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => startRound(round + 1)}>
              {fill(t.practice.nextRound, { n: nextSize })}
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSize(null); setRound(0) }}>
              {t.practice.practiseAgain}
            </button>
          )}
          {/* The Practice tab, not the dashboard's first tab. Somebody who
              just finished a round is not done with practice. */}
          <a className={`btn btn-sm ${left > 0 ? 'btn-ghost' : 'btn-primary'}`} href="/student/dashboard#practice">
            {t.practice.backToPractice}
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
      setQueue((q) => {
        const rest = q.slice(1)
        // The round is over at the moment the last card is cleared, which is
        // the only place that knows how it went.
        if (rest.length === 0) logRound(roundCards.length, roundCards.length - missed)
        return rest
      })
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
              "round 3 of 9": naming the total re-hangs the whole deck over
              someone who has just sat down. */}
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
          <span className="k-prac-tap">{t.practice.tapToSee}</span>
        )}
      </button>

      {flipped ? (
        <div className="k-prac-acts">
          <button type="button" className="k-prac-act again" onClick={() => answer(false)}>{t.practice.again}</button>
          <button type="button" className="k-prac-act knew" onClick={() => answer(true)}>{t.practice.knewIt}</button>
        </div>
      ) : (
        <p className="k-prac-hint">{t.practice.sayOutLoud}</p>
      )}
    </div>
  )
}
