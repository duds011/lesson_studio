'use client'

import { useState } from 'react'
import { formatDateShort } from '@/lib/portal-utils'
import { speakingExercises, type Exercise } from '@/lib/speaking'
import SpeakingRecorder from './portal/SpeakingRecorder'
import AudioPlayer from './portal/AudioPlayer'

/** A take the student has already sent, keyed by the exercise it answers. */
export type SpeakingTake = { id: string; prompt_index: number; created_at: string }

/**
 * Everything the speaking half of this tab needs to be more than a printout.
 * Left off entirely — the branding studio's preview does — the exercises render
 * as they always did, read-only.
 */
export type SpeakingConfig = {
  lessonId: string
  /** The teacher collects speaking recordings. Off, and these are dropped. */
  enabled: boolean
  role: 'student' | 'teacher'
  takes: SpeakingTake[]
}

// Interactive practice exercises (mirrors teacher-portal LessonExercises, but
// self-contained — the graded answers are checked locally, and only the spoken
// ones reach the server).
export default function LessonExercises({ exercises, speaking }: { exercises: Exercise[]; speaking?: SpeakingConfig }) {
  if (!exercises?.length) return <p className="analytics-note">No practice exercises for this lesson.</p>

  // Switched off, the speaking exercises are not shown as homework nobody can
  // hand in — they are not shown at all.
  const spoken = speaking && !speaking.enabled ? [] : speakingExercises(exercises)
  const graded = exercises.filter((e) => e.type === 'multiple_choice' || e.type === 'fill_blank')

  if (!spoken.length && !graded.length) return <p className="analytics-note">No practice exercises for this lesson.</p>

  const takeFor = (index: number) => speaking?.takes.find((t) => t.prompt_index === index) ?? null

  return (
    <div>
      {spoken.map(({ ex, index }) => (
        <SpeakingExercise key={`s${index}`} ex={ex} index={index} speaking={speaking} take={takeFor(index)} />
      ))}
      {graded.map((ex, i) => <GradedExercise key={`g${i}`} ex={ex} />)}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="ex-tag">{children}</span>
}

function SpeakingExercise({
  ex, index, speaking, take,
}: {
  ex: Exercise; index: number; speaking?: SpeakingConfig; take: SpeakingTake | null
}) {
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

      {/* The student records here; the teacher hears it in the same place,
          under the sentence it answers. Without a config — the studio preview
          — neither appears and the card is the printout it always was. */}
      {speaking?.enabled && speaking.role === 'student' && (
        <SpeakingRecorder
          lessonId={speaking.lessonId}
          promptIndex={index}
          existing={take}
          cta={ex.type === 'read_aloud' ? 'Record yourself reading these' : 'Record your answer'}
        />
      )}
      {speaking?.enabled && speaking.role === 'teacher' && (
        take ? (
          <div className="ex-speak">
            <AudioPlayer
              src={`/api/portal/download?kind=audio&id=${take.id}`}
              title="Their recording"
              meta={formatDateShort(take.created_at)}
            />
          </div>
        ) : (
          <div className="ex-speak">
            <p className="analytics-note" style={{ margin: 0 }}>Not recorded yet.</p>
          </div>
        )
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
        {opts.map((o, i) => {
          // Same verdict colours as multiple choice: the right answer goes
          // green, a wrong pick goes red, the rest fade.
          let cls = 'ex-opt pill'
          if (picked !== null) {
            if (o === correct) cls += ' correct'
            else if (o === picked) cls += ' wrong'
            else cls += ' dim'
          }
          return (
            <button key={i} className={cls} disabled={picked !== null} onClick={() => setPicked(o)}>
              {o}{picked !== null && o === correct && ' ✓'}{picked !== null && o === picked && o !== correct && ' ✗'}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        isCorrect
          ? <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '.82rem', marginTop: '.5rem' }}>✓ Correct!</p>
          : <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: '.82rem', marginTop: '.5rem' }}>✗ Not quite — the answer is <span style={{ color: 'var(--green)' }}>{correct}</span></p>
      )}
    </div>
  )
}
