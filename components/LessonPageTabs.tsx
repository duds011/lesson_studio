'use client'

import { useState } from 'react'
import { FormattedContent } from './RecapView'
import LessonExercises from './LessonExercises'

type Recap = any
type Lesson = { id: string; lessonNumber: number; date: string; title: string; recap: Recap }

const JLPT = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

export default function LessonPageTabs({
  lesson, studentFirst, teacherFirst = 'Your teacher',
}: {
  lesson: Lesson; studentFirst: string; teacherFirst?: string
}) {
  const r = lesson.recap
  const hasWhiteboard = typeof r.whiteboard_html === 'string' && r.whiteboard_html.trim().length > 0
  const TABS = ['Progress', 'Lesson', 'Homework', 'Vocabulary', ...(hasWhiteboard ? ['Whiteboard'] : [])] as const
  type Tab = typeof TABS[number]
  const [tab, setTab] = useState<Tab>('Progress')

  const studentTalk = typeof r.talk_percentage === 'number' ? r.talk_percentage : 40
  const teacherTalk = 100 - studentTalk

  const allSections: any[] = r.sections || []
  const corrections = allSections.find((s) => /main corrections|refinement|takeaway/i.test(s.title))
  const lessonSections = allSections.filter((s) => !/main corrections|refinement|takeaway/i.test(s.title))

  const dist: Record<string, number> = r.vocab_level_distribution || {}
  const distMax = Math.max(1, ...JLPT.map((l) => dist[l] ?? 0))

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Lesson recap sections">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'sel' : ''}`} onClick={() => setTab(t)}>{t === 'Homework' ? 'Practice' : t}</button>
        ))}
      </div>

      {/* ── PROGRESS ── */}
      {tab === 'Progress' && (
        <div className="lesson-dashboard" role="tabpanel">
          <h3 className="dashboard-title">How this lesson went</h3>
          <div className="stat-cards">
            {/* Speaking balance */}
            <div className="stat-card" style={{ ['--accent' as any]: 'var(--brand)' }}>
              <div className="stat-card-head"><span className="stat-icon">🗣️</span><span className="stat-card-label">Speaking balance</span></div>
              <div className="stat-card-value">{studentTalk}<span className="stat-unit">%</span> <span className="stat-sep">/</span> {teacherTalk}<span className="stat-unit">%</span></div>
              <div className="balance-bars" style={{ marginTop: 'auto' }}>
                <div className="balance-row"><span>{studentFirst}</span><div className="balance-track"><div className="balance-fill student" style={{ width: `${studentTalk}%` }} /></div><span>{studentTalk}%</span></div>
                <div className="balance-row"><span>{teacherFirst}</span><div className="balance-track"><div className="balance-fill" style={{ width: `${teacherTalk}%` }} /></div><span>{teacherTalk}%</span></div>
              </div>
            </div>

            {/* Score */}
            <div className="stat-card" style={{ ['--accent' as any]: 'var(--green)' }}>
              <div className="stat-card-head"><span className="stat-icon">⭐</span><span className="stat-card-label">Score</span></div>
              <div className="stat-card-value" style={{ color: 'var(--green)' }}>{r.score}<span className="stat-unit">/10</span></div>
              {r.confidence_label && <span className="stat-chip" style={{ marginTop: 'auto' }}>{r.confidence_label}</span>}
            </div>

            {/* Grammar density */}
            <div className="stat-card" style={{ ['--accent' as any]: '#a36210' }}>
              <div className="stat-card-head"><span className="stat-icon">📚</span><span className="stat-card-label">Grammar density</span></div>
              <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>{r.grammar_density}</div>
              <p className="stat-card-note" style={{ marginTop: 'auto' }}>{r.vocab_total_count ? `${r.vocab_total_count} vocabulary items practiced` : ''}</p>
            </div>
          </div>

          {corrections && (
            <div className="corrections-card">
              <div className="stat-card-head" style={{ marginBottom: '.75rem' }}><span className="stat-icon">✍️</span><span className="stat-card-label">{corrections.title.replace(/^\d+\.\s*/, '')}</span></div>
              <FormattedContent content={corrections.content} />
            </div>
          )}
        </div>
      )}

      {/* ── LESSON ── */}
      {tab === 'Lesson' && (
        <div className="tab-panel" role="tabpanel">
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
          {r.teacher_note && (
            <div className="lesson-block"><h3>Teacher’s Note</h3><p>{r.teacher_note}</p></div>
          )}
        </div>
      )}

      {/* ── HOMEWORK ── */}
      {tab === 'Homework' && (
        <div className="tab-panel" role="tabpanel">
          <div className="lesson-block">
            <h3>Homework</h3>
            {(r.homework?.length ?? 0) === 0 ? <p className="analytics-note">No homework for this lesson.</p> : (
              <ul>{r.homework.map((h: any, i: number) => <li key={i}>{h.description}</li>)}</ul>
            )}
          </div>
          <div className="lesson-block">
            <h3>Practice exercises</h3>
            <LessonExercises exercises={r.exercises || []} />
          </div>
        </div>
      )}

      {/* ── VOCABULARY ── */}
      {tab === 'Vocabulary' && (
        <div className="tab-panel" role="tabpanel">
          <div className="lesson-block">
            <h3>Vocabulary by JLPT level</h3>
            {JLPT.map((lv) => (
              <div className="balance-row" key={lv} style={{ gridTemplateColumns: '40px 1fr 32px' }}>
                <span>{lv}</span>
                <div className="balance-track"><div className="balance-fill student" style={{ width: `${((dist[lv] ?? 0) / distMax) * 100}%` }} /></div>
                <span>{dist[lv] ?? 0}</span>
              </div>
            ))}
          </div>
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
        </div>
      )}

      {/* ── WHITEBOARD ── */}
      {tab === 'Whiteboard' && (
        <div className="tab-panel" role="tabpanel">
          <div className="lesson-block">
            <h3>Shared lesson notes</h3>
            <p className="analytics-note" style={{ marginTop: 0 }}>What you and your teacher wrote together during the lesson.</p>
            <div className="wb-content" dangerouslySetInnerHTML={{ __html: r.whiteboard_html }} />
          </div>
        </div>
      )}
    </div>
  )
}
