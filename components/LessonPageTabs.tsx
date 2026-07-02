'use client'

import { useState } from 'react'
import { FormattedContent } from './RecapView'
import LessonExercises from './LessonExercises'

type Recap = any
type Lesson = { id: string; lessonNumber: number; date: string; title: string; recap: Recap }

const JLPT = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
const TABS = ['Progress', 'Lesson', 'Homework', 'Vocabulary'] as const
type Tab = typeof TABS[number]

export default function LessonPageTabs({
  lesson, studentFirst, teacherFirst = 'Teacher',
}: {
  lesson: Lesson; studentFirst: string; teacherFirst?: string
}) {
  const [tab, setTab] = useState<Tab>('Progress')
  const r = lesson.recap

  const studentTalk = typeof r.talk_percentage === 'number' ? r.talk_percentage : 40
  const teacherTalk = 100 - studentTalk

  const allSections: any[] = r.sections || []
  const corrections = allSections.find((s) => /main corrections|refinement|takeaway/i.test(s.title))
  const lessonSections = allSections.filter((s) => !/main corrections|refinement|takeaway/i.test(s.title))

  const dist: Record<string, number> = r.vocab_level_distribution || {}
  const distMax = Math.max(1, ...JLPT.map((l) => dist[l] ?? 0))

  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'sel' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── PROGRESS ── */}
      {tab === 'Progress' && (
        <div className="lesson-dashboard">
          <h3 className="dashboard-title">Lesson overview</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-label">Speaking Balance</div>
              <div className="analytics-value">{studentTalk}% / {teacherTalk}%</div>
              <div className="balance-bars">
                <div className="balance-row"><span>{studentFirst}</span><div className="balance-track"><div className="balance-fill student" style={{ width: `${studentTalk}%` }} /></div><span>{studentTalk}%</span></div>
                <div className="balance-row"><span>{teacherFirst}</span><div className="balance-track"><div className="balance-fill" style={{ width: `${teacherTalk}%` }} /></div><span>{teacherTalk}%</span></div>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-label">Score</div>
              <div className="analytics-value">{r.score}</div>
              <div className="independence-pill">{r.confidence_label}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-label">Grammar Density</div>
              <div className="analytics-value" style={{ fontSize: '1.4rem' }}>{r.grammar_density}</div>
              <p className="analytics-note">{r.vocab_total_count ? `${r.vocab_total_count} vocabulary items practiced` : ''}</p>
            </div>
          </div>
          {corrections && (
            <div className="analytics-card">
              <div className="analytics-label">{corrections.title.replace(/^\d+\.\s*/, '')}</div>
              <div style={{ marginTop: '.5rem' }}><FormattedContent content={corrections.content} /></div>
            </div>
          )}
        </div>
      )}

      {/* ── LESSON ── */}
      {tab === 'Lesson' && (
        <div>
          <div className="lesson-block"><FormattedContent content={r.recap} /></div>
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
        <div>
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
        <div>
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
    </div>
  )
}
