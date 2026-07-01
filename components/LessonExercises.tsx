'use client'

import { useState } from 'react'

type Exercise = { type: string; prompt: string; data: any }

// Interactive practice exercises (mirrors teacher-portal LessonExercises, but
// self-contained — answers are checked locally, no backend submission needed).
export default function LessonExercises({ exercises }: { exercises: Exercise[] }) {
  if (!exercises?.length) return <p className="analytics-note">No practice exercises for this lesson.</p>

  const speaking = exercises.filter((e) => e.type === 'read_aloud' || e.type === 'speak')
  const graded = exercises.filter((e) => e.type === 'multiple_choice' || e.type === 'fill_blank')

  return (
    <div>
      {speaking.map((ex, i) => <SpeakingExercise key={`s${i}`} ex={ex} />)}
      {graded.map((ex, i) => <GradedExercise key={`g${i}`} ex={ex} />)}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="ex-tag">{children}</span>
}

function SpeakingExercise({ ex }: { ex: Exercise }) {
  return (
    <div className="ex-card">
      <div className="ex-head"><Tag>🎙️ Speaking</Tag><span className="ex-prompt">{ex.prompt}</span></div>
      {ex.type === 'read_aloud' ? (
        <>
          {ex.data?.focus && <p className="analytics-note" style={{ margin: '0 0 .5rem' }}>Focus: {ex.data.focus}</p>}
          {(ex.data?.sentences ?? []).map((s: any, j: number) => (
            <div className="ex-line" key={j}>
              <p className="jp" style={{ margin: 0 }}>{s.jp}</p>
              {s.en && <p className="analytics-note" style={{ margin: '.1rem 0 0' }}>{s.en}</p>}
            </div>
          ))}
        </>
      ) : (
        <div className="ex-line">
          <p className="jp" style={{ margin: 0 }}>{ex.data?.prompt_jp}</p>
          {ex.data?.prompt_en && <p className="analytics-note" style={{ margin: '.1rem 0 0' }}>{ex.data.prompt_en}</p>}
          {ex.data?.hint && <p style={{ margin: '.4rem 0 0', fontSize: '.8rem', color: 'var(--brand)' }}>💡 {ex.data.hint}</p>}
        </div>
      )}
    </div>
  )
}

function GradedExercise({ ex }: { ex: Exercise }) {
  const [picked, setPicked] = useState<number | string | null>(null)

  if (ex.type === 'multiple_choice') {
    const opts: string[] = ex.data?.options ?? []
    const correct: number = ex.data?.answer ?? 0
    return (
      <div className="ex-card">
        <div className="ex-head"><Tag>✅ Quick check</Tag></div>
        <p className="ex-q">{ex.data?.question || ex.prompt}</p>
        <div className="ex-opts">
          {opts.map((o, i) => {
            let cls = 'ex-opt'
            if (picked !== null) {
              if (i === correct) cls += ' correct'
              else if (i === picked) cls += ' wrong'
              else cls += ' dim'
            }
            return (
              <button key={i} className={cls} disabled={picked !== null} onClick={() => setPicked(i)}>
                {o}{picked !== null && i === correct && ' ✓'}{picked !== null && i === picked && i !== correct && ' ✗'}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // fill_blank
  const opts: string[] = ex.data?.options ?? []
  const correct: string = ex.data?.answer ?? ''
  const isCorrect = picked !== null && picked === correct
  return (
    <div className="ex-card">
      <div className="ex-head"><Tag>✏️ Fill in the blank</Tag></div>
      <div className="ex-fill">
        {ex.data?.before}
        <span className={`ex-gap ${picked !== null ? (isCorrect ? 'ok' : 'no') : ''}`}>{picked !== null ? String(picked) : '＿＿'}</span>
        {ex.data?.after}
      </div>
      {ex.data?.en && <p className="analytics-note" style={{ margin: '0 0 .5rem' }}>{ex.data.en}</p>}
      <div className="ex-opts row">
        {opts.map((o, i) => (
          <button key={i} className="ex-opt pill" disabled={picked !== null} onClick={() => setPicked(o)}>{o}</button>
        ))}
      </div>
      {picked !== null && !isCorrect && <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '.82rem', marginTop: '.5rem' }}>✓ Correct: {correct}</p>}
    </div>
  )
}
