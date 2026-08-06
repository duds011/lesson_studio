'use client'

import { useState } from 'react'
import { FormattedContent } from './RecapView'
import LessonExercises from './LessonExercises'
import LessonCorrections from './LessonCorrections'
import { VocabLevelChart } from './portal/BrandCharts'
import CountUp from './portal/CountUp'
import {
  DEFAULT_BRAND, LESSON_BLOCK_TAB, LESSON_LAYOUT, LESSON_TABS,
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
  lesson, studentFirst, teacherFirst = 'Your teacher', brand = DEFAULT_BRAND,
}: {
  lesson: Lesson; studentFirst: string; teacherFirst?: string; brand?: Brand
}) {
  const r = lesson.recap
  const m = r.metrics as any
  const [tab, setTab] = useState<LessonTab>('Progress')

  const studentTalk = typeof r.talk_percentage === 'number' ? r.talk_percentage : 40
  const teacherTalk = 100 - studentTalk

  const allSections: any[] = r.sections || []
  // Recaps built before corrections were structured carry them as a free-text
  // section instead. Both shapes render, so published lessons keep working.
  const legacyCorrections = allSections.find((s) => /main corrections|refinement|takeaway/i.test(s.title))
  const lessonSections = allSections.filter((s) => !/main corrections|refinement|takeaway/i.test(s.title))
  const corrections: any[] = Array.isArray(r.corrections) ? r.corrections : []
  const didWell: any[] = Array.isArray(r.did_well) ? r.did_well : []

  const dist: Record<string, number> = r.vocab_level_distribution || {}

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
        if (lessonSections.length === 0 && !r.audio_script) return null
        return (
          <div>
            {lessonSections.map((s, i) => (
              <div className="lesson-block" key={i}>
                <h3>{s.title}</h3>
                <FormattedContent content={s.content} />
              </div>
            ))}
            {r.audio_script && (
              <div className="lesson-block">
                <h3>Voice memo script</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{r.audio_script}</p>
              </div>
            )}
          </div>
        )
      case 'notes':
        if (!r.teacher_note) return null
        return <div className="lesson-block"><h3>Teacher’s Note</h3><p>{r.teacher_note}</p></div>
      case 'homework':
        return (
          <div className="lesson-block">
            <h3>Homework</h3>
            {(r.homework?.length ?? 0) === 0 ? <p className="analytics-note">No homework for this lesson.</p> : (
              <ul>{r.homework.map((hw: any, i: number) => <li key={i}>{hw.description}</li>)}</ul>
            )}
          </div>
        )
      case 'exercises':
        return (
          <div className="lesson-block">
            <h3>Practice exercises</h3>
            <LessonExercises exercises={r.exercises || []} />
          </div>
        )
      case 'vocabLevels': {
        const total = Object.values(dist).reduce((a, b) => a + Number(b || 0), 0)
        if (!total) return null
        return (
          <div className="lesson-block k-chart-card">
            <h3>Vocabulary by level</h3>
            <VocabLevelChart distribution={dist} height={150} />
          </div>
        )
      }
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

  // Our arrangement for this tab. The teacher styles the recap; they do not
  // rearrange it — see LESSON_LAYOUT in lib/brand.
  const placements = LESSON_LAYOUT.filter((p) => LESSON_BLOCK_TAB[p.id] === tab)

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Lesson recap sections">
        {LESSON_TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'sel' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Keyed on the tab so switching remounts the panel and its cards run
          their entrance again — the page answers the click. */}
      <div className="k-flow" role="tabpanel" key={tab}>
        {placements.map(({ id, w }) => {
          const content = section(id)
          if (!content) return null
          return <div key={id} style={{ ['--w' as any]: w }}>{content}</div>
        })}
      </div>
    </div>
  )
}
