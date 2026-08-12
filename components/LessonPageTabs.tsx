'use client'

import { useState } from 'react'
import { FormattedContent } from './RecapView'
import LessonExercises from './LessonExercises'
import LessonCorrections from './LessonCorrections'
import Flashcards from './Flashcards'
import CountUp from './portal/CountUp'
import {
  DEFAULT_BRAND, LESSON_BLOCK_LABELS, LESSON_BLOCK_TAB, LESSON_BLOCK_TOGGLE, LESSON_LAYOUT, LESSON_TABS,
  type Brand, type LessonBlockId, type LessonTab,
} from '@/lib/brand'

type Recap = any
type Lesson = { id: string; lessonNumber: number; date: string; title: string; recap: Recap }

/** A measured number, or an em dash when the recording didn't yield one. */
function Metric({ v, decimals = 0, suffix = '' }: { v: unknown; decimals?: number; suffix?: string }) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return <>—</>
  return <CountUp value={v} decimals={decimals} suffix={suffix} />
}

export default function LessonPageTabs({
  lesson, studentFirst, teacherFirst = 'Your teacher', brand = DEFAULT_BRAND, memo, files, preview,
  tab: controlledTab, onTabChange, onRemoveSection,
}: {
  lesson: Lesson; studentFirst: string; teacherFirst?: string; brand?: Brand
  /** The teacher's voice memo, opening the Progress tab. Omitted = no block. */
  memo?: React.ReactNode
  /** File exchange, filling the Files tab. Omitted = no tab. */
  files?: React.ReactNode
  /**
   * Branding-studio canvas. The memo and the file drawer are the two sections
   * whose contents come from uploads rather than the recap, so a preview has
   * nothing to pass them — and a teacher deciding whether to keep those
   * sections has to be able to see them. Under `preview` they stand in for
   * themselves, in the page's own markup.
   */
  preview?: boolean
  /** Drive the tab from outside — the studio's Sections menu does, so picking a
   *  group there opens the tab it edits. Left off, the page owns its own. */
  tab?: LessonTab
  onTabChange?: (t: LessonTab) => void
  /**
   * Studio only: lets the teacher remove a section from the page itself.
   * When set, hovering any section shows its name and a ✕ — see .k-zap. The
   * student's page never passes this, so students never see the buttons.
   */
  onRemoveSection?: (id: LessonBlockId) => void
}) {
  const r = lesson.recap
  const m = r.metrics as any
  const [ownTab, setOwnTab] = useState<LessonTab>('Progress')
  const tab = controlledTab ?? ownTab
  const setTab = onTabChange ?? setOwnTab

  const studentTalk = typeof r.talk_percentage === 'number' ? r.talk_percentage : 40
  const teacherTalk = 100 - studentTalk

  const allSections: any[] = r.sections || []
  // Recaps built before corrections were structured carry them as a free-text
  // section instead. Both shapes render, so published lessons keep working.
  const legacyCorrections = allSections.find((s) => /main corrections|refinement|takeaway/i.test(s.title))
  const lessonSections = allSections.filter((s) => !/main corrections|refinement|takeaway/i.test(s.title))
  const corrections: any[] = Array.isArray(r.corrections) ? r.corrections : []
  const didWell: any[] = Array.isArray(r.did_well) ? r.did_well : []
  // Checked by type, not by .length. A string has a length too, so a recap
  // whose homework came back as prose rather than a list sailed past the old
  // `homework?.length > 0` guard and then threw on .map, white-screening the
  // whole page. The model writes this JSON; it does not always write it twice
  // the same way.
  const homework: any[] = Array.isArray(r.homework) ? r.homework : []

  /** Height a chart gets inside a block the teacher sized (card chrome removed). */

  /**
   * Every arrangeable section of this page, keyed the same way as the studio
   * preview. A section that has nothing to show returns null and drops out of
   * the flow entirely.
   */
  const section = (id: LessonBlockId): React.ReactNode => {
    switch (id) {
      case 'balance':
        return (
          <div className="stat-card" style={{ ['--accent' as any]: 'var(--brand)' }}>
            <div className="stat-card-head"><span className="stat-icon">🗣️</span><span className="stat-card-label">Speaking balance</span></div>
            <div className="stat-card-value"><CountUp value={studentTalk} /><span className="stat-unit">%</span> <span className="stat-sep">/</span> <CountUp value={teacherTalk} /><span className="stat-unit">%</span></div>
            <div className="balance-bars" style={{ marginTop: 'auto' }}>
              <div className="balance-row"><span>{studentFirst}</span><div className="balance-track"><div className="balance-fill student" style={{ width: `${studentTalk}%` }} /></div><span>{studentTalk}%</span></div>
              <div className="balance-row"><span>{teacherFirst}</span><div className="balance-track"><div className="balance-fill" style={{ width: `${teacherTalk}%` }} /></div><span>{teacherTalk}%</span></div>
            </div>
          </div>
        )
      case 'score':
        if (r.score == null) return null
        return (
          <div className="stat-card" style={{ ['--accent' as any]: 'var(--green)' }}>
            <div className="stat-card-head"><span className="stat-icon">⭐</span><span className="stat-card-label">Score</span></div>
            <div className="stat-card-value" style={{ color: 'var(--green)' }}>
              <CountUp value={Number(r.score)} decimals={Number.isInteger(Number(r.score)) ? 0 : 1} />
              <span className="stat-unit">/10</span>
            </div>
            {r.confidence_label && <span className="stat-chip" style={{ marginTop: 'auto' }}>{r.confidence_label}</span>}
          </div>
        )
      case 'grammar':
        if (!r.grammar_density) return null
        return (
          <div className="stat-card" style={{ ['--accent' as any]: '#a36210' }}>
            <div className="stat-card-head"><span className="stat-icon">📚</span><span className="stat-card-label">Grammar density</span></div>
            <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>{r.grammar_density}</div>
            <p className="stat-card-note" style={{ marginTop: 'auto' }}>{r.vocab_total_count ? `${r.vocab_total_count} vocabulary items practiced` : ''}</p>
          </div>
        )
      case 'metrics':
        if (!m) return null
        return (
          <div className="corrections-card">
            <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">⚡</span><span className="stat-card-label">Your speaking, measured</span></div>
            <div className="metric-grid">
              <div className="metric"><div className="mv"><Metric v={m.studentWpm} /></div><div className="mk">words / min</div><div className="mn">speaking pace</div></div>
              <div className="metric"><div className="mv"><Metric v={m.avgResponseSec} decimals={1} suffix="s" /></div><div className="mk">thinking time</div><div className="mn">before you reply</div></div>
              <div className="metric"><div className="mv"><Metric v={m.longestTurnSec} suffix="s" /></div><div className="mk">longest answer</div><div className="mn">best stretch</div></div>
              <div className="metric"><div className="mv"><Metric v={m.avgTurnWords} /></div><div className="mk">words / answer</div><div className="mn">avg turn length</div></div>
              <div className="metric"><div className="mv"><Metric v={m.fillerCount} /></div><div className="mk">hesitation words</div><div className="mn">えーと, あの…</div></div>
              <div className="metric"><div className="mv"><Metric v={m.longPauseCount} /></div><div className="mk">long pauses</div><div className="mn">silences ≥ 1.5s</div></div>
            </div>
          </div>
        )
      case 'corrections':
        if (corrections.length > 0 || didWell.length > 0) {
          return (
            <div className="corrections-card">
              <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">✍️</span><span className="stat-card-label">Corrections</span></div>
              <LessonCorrections corrections={corrections} didWell={didWell} who={studentFirst} />
            </div>
          )
        }
        if (!legacyCorrections) return null
        return (
          <div className="corrections-card">
            <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">✍️</span><span className="stat-card-label">{legacyCorrections.title.replace(/^\d+\.\s*/, '')}</span></div>
            <FormattedContent content={legacyCorrections.content} />
          </div>
        )
      case 'sections':
        if (lessonSections.length === 0) return null
        // .lesson-stack, not a bare div: the recap preview gives every direct
        // child of a flow cell the full row height, and an unnamed wrapper
        // passed that down to each note inside it — the first note grew to fill
        // the tab and pushed the rest off the bottom.
        return (
          <div className="lesson-stack">
            {lessonSections.map((s, i) => (
              <div className="lesson-block" key={i}>
                <h3>{s.title}</h3>
                <FormattedContent content={s.content} />
              </div>
            ))}
          </div>
        )
      case 'memo':
        // The script sits WITH the recorder that reads it — it used to trail
        // the sections at the very bottom of the tab, a page away.
        if (!memo && !r.audio_script && !preview) return null
        return (
          <div className="lesson-stack">
            {memo}
            {!memo && preview && (
              <div className="lesson-block">
                <h3>💬 A message from {teacherFirst}</h3>
                <p className="analytics-note" style={{ margin: '8px 0 0' }}>
                  The voice memo you record for this lesson plays here.
                </p>
              </div>
            )}
            {r.audio_script && (
              <div className="lesson-block">
                <h3>Voice memo script</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{r.audio_script}</p>
              </div>
            )}
          </div>
        )
      case 'files':
        if (files) return files
        if (!preview) return null
        return (
          <div className="lesson-stack">
            <div className="lesson-block">
              <h3 style={{ margin: '0 0 12px' }}>📎 Files from your teacher</h3>
              <p className="analytics-note" style={{ margin: 0 }}>
                Presentations and PDFs you attach to this lesson, ready to download.
              </p>
            </div>
            <div className="lesson-block">
              <h3 style={{ margin: '0 0 12px' }}>🎙️ Practice audio</h3>
              <p className="analytics-note" style={{ margin: 0 }}>
                Your student records themselves here, and you listen back.
              </p>
            </div>
          </div>
        )
      case 'homework':
        return (
          <div className="lesson-block">
            <h3>Homework</h3>
            {homework.length === 0 ? <p className="analytics-note">No homework for this lesson.</p> : (
              <ul>{homework.map((hw: any, i: number) => <li key={i}>{hw.description ?? String(hw)}</li>)}</ul>
            )}
          </div>
        )
      case 'exercises':
        return (
          <div className="lesson-block">
            <h3>Practice exercises</h3>
            {/* Flashcards first: a warm-up over the lesson's own words before
                the graded questions that use them. */}
            <Flashcards vocabulary={r.vocabulary || []} />
            <LessonExercises exercises={r.exercises || []} />
          </div>
        )
      case 'vocabWords':
        if ((r.vocabulary || []).length === 0) return null
        return (
          <div className="lesson-block">
            <h3>Words from this lesson</h3>
            {(r.vocabulary || []).map((v: any, i: number) => (
              <div className="example" key={i}>
                <span className="jp">{v.word}</span> <span className="romaji">{v.reading}</span>
                {v.jlpt_level && <span className="jlpt sm"> {v.jlpt_level}</span>}
                <br />{v.definition}
                {v.example_sentence && <><br /><span className="jp" style={{ fontWeight: 600 }}>{v.example_sentence}</span></>}
              </div>
            ))}
          </div>
        )
    }
  }

  // Our arrangement, block by block. The teacher styles the recap; they do not
  // rearrange it — see LESSON_LAYOUT in lib/brand.
  //
  // Rendered up front rather than per tab so a tab with nothing in it can be
  // left off the bar entirely: a student whose teacher shared no files should
  // not be offered a Files tab that opens onto an apology.
  const built = LESSON_LAYOUT
    .filter(({ id }) => brand[LESSON_BLOCK_TOGGLE[id]] !== false)
    .map(({ id, w }) => ({ id, w, tab: LESSON_BLOCK_TAB[id], content: section(id) }))
    .filter((b) => b.content)

  const tabs = LESSON_TABS.filter((t) => built.some((b) => b.tab === t))
  // The remembered tab can vanish — a memo deleted, the last file removed.
  const active = tabs.includes(tab) ? tab : tabs[0]
  if (!active) return null

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Lesson recap sections">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={active === t} className={`tab ${active === t ? 'sel' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Keyed on the tab so switching remounts the panel and its cards run
          their entrance again — the page answers the click. */}
      <div className="k-flow" role="tabpanel" key={active}>
        {built.filter((b) => b.tab === active).map(({ id, w, content }) => (
          <div key={id} style={{ ['--w' as any]: w }} className={onRemoveSection ? 'k-zap' : undefined}>
            {onRemoveSection && (
              <>
                <span className="k-zap-tag" aria-hidden>{LESSON_BLOCK_LABELS[id]}</span>
                <button
                  type="button"
                  className="k-zap-x"
                  aria-label={`Remove ${LESSON_BLOCK_LABELS[id]}`}
                  title={`Remove ${LESSON_BLOCK_LABELS[id]}`}
                  onClick={() => onRemoveSection(id)}
                >✕</button>
              </>
            )}
            {content}
          </div>
        ))}
      </div>
    </div>
  )
}
