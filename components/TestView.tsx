'use client'

import { useMemo, useState, useTransition } from 'react'
import { submitTestAttempt } from '@/app/actions/tests'
// Aliased: MCQuestion and GapQuestion each declare their own `isCorrect` for a
// single option, which is a different question from "did the student get this
// right". Same name, same file, two meanings is how you misread code later.
import { gradeableQuestions, isCorrect as answerIsCorrect, type Answers } from '@/lib/test-grading'

// Renders a generated test. `review` mode (teacher): every answer highlighted
// with its explanation. `take` mode (student): interactive — pick an option,
// get instant right/wrong feedback, running score at the top.
type Mode = 'review' | 'take'

function MCQuestion({
  q, num, id, mode, answers, onAnswer,
}: {
  q: any; num: number; id: string; mode: Mode; answers: Answers; onAnswer: (id: string, v: number) => void
}) {
  const picked = answers[id] as number | undefined
  const revealed = mode === 'review' || picked !== undefined
  return (
    <div className="test-q">
      <p className="test-q-text"><span className="test-q-num">{num}</span>{q.question}</p>
      <div className="test-options">
        {q.options.map((opt: string, i: number) => {
          const isCorrect = i === q.answer
          const isPicked = picked === i
          let cls = 'test-opt'
          if (revealed && isCorrect) cls += ' correct'
          else if (isPicked && !isCorrect) cls += ' wrong'
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={mode === 'review' || picked !== undefined}
              onClick={() => onAnswer(id, i)}
            >
              <span className="test-opt-letter">{String.fromCharCode(65 + i)}</span>{opt}
            </button>
          )
        })}
      </div>
      {revealed && q.explanation && <p className="test-explain">{q.explanation}</p>}
    </div>
  )
}

function GapQuestion({
  q, num, id, mode, answers, onAnswer,
}: {
  q: any; num: number; id: string; mode: Mode; answers: Answers; onAnswer: (id: string, v: string) => void
}) {
  const picked = answers[id] as string | undefined
  const revealed = mode === 'review' || picked !== undefined
  const shown = revealed ? q.answer : '＿＿＿'
  return (
    <div className="test-q">
      <p className="test-q-text">
        <span className="test-q-num">{num}</span>
        <span className="jp">{q.before} <strong className="test-gap">{shown}</strong> {q.after}</span>
      </p>
      {q.en && revealed && <p className="test-explain" style={{ marginTop: 2 }}>{q.en}</p>}
      <div className="test-options">
        {q.options.map((opt: string, i: number) => {
          const isCorrect = opt === q.answer
          const isPicked = picked === opt
          let cls = 'test-opt'
          if (revealed && isCorrect) cls += ' correct'
          else if (isPicked && !isCorrect) cls += ' wrong'
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={mode === 'review' || picked !== undefined}
              onClick={() => onAnswer(id, opt)}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function TestView({
  test, mode, testId, savedScore,
}: {
  test: any
  mode: Mode
  /** Present in `take` mode: lets the finished attempt be recorded. */
  testId?: string
  /** A score already on record, if this test has been taken before. */
  savedScore?: number | null
}) {
  const [answers, setAnswers] = useState<Answers>({})
  const onAnswer = (id: string, v: number | string) => setAnswers((a) => ({ ...a, [id]: v }))
  const [saved, setSaved] = useState<number | null>(savedScore ?? null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  const parts: any[] = Array.isArray(test?.parts) ? test.parts : []

  // The same grader the server uses, so the number on screen while answering is
  // the number that gets recorded.
  const gradeable = useMemo(() => gradeableQuestions(test), [test])

  const answered = gradeable.filter((g) => answers[g.id] !== undefined)
  const correct = answered.filter((g) => answerIsCorrect(answers[g.id], g.correct))
  const allAnswered = gradeable.length > 0 && answered.length === gradeable.length

  const finish = () => {
    if (!testId) return
    setSaveError(null)
    startSaving(async () => {
      const res = await submitTestAttempt(testId, answers)
      if (res.success) setSaved(res.score ?? null)
      else setSaveError(res.error ?? 'Could not save your score.')
    })
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {test.intro && <p className="sub" style={{ margin: 0 }}>{test.intro}</p>}

      {mode === 'take' && gradeable.length > 0 && (
        <div className="test-scorebar">
          <strong>{correct.length}</strong>&nbsp;correct of&nbsp;<strong>{answered.length}</strong>&nbsp;answered
          <span style={{ color: 'var(--muted)' }}>&nbsp;· {gradeable.length} questions total</span>

          {/* Saved wins over the live count: once a score is on record, that is
              the number that matters. */}
          {saved !== null ? (
            <span className="pill" style={{ marginLeft: 'auto', background: 'var(--green-soft)', color: 'var(--green)' }}>
              ✓ Saved — {saved}%
            </span>
          ) : allAnswered && testId ? (
            <button
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={finish}
              disabled={saving}
            >
              {saving ? 'Saving…' : `Finish — ${Math.round((correct.length / gradeable.length) * 100)}%`}
            </button>
          ) : null}
        </div>
      )}

      {saveError && (
        <p className="sub" style={{ margin: 0, color: 'var(--red)' }}>
          {saveError} Your answers are still on screen — try Finish again.
        </p>
      )}

      {parts.map((part, pi) => (
        <div className="lesson-block" key={pi}>
          <h3 style={{ marginBottom: 2 }}>{part.title}</h3>
          <p className="analytics-note" style={{ margin: '0 0 14px', fontSize: 12 }}>{part.instructions}</p>

          {part.key === 'reading' ? (
            (part.passages ?? []).map((pas: any, xi: number) => (
              <div key={xi} style={{ marginBottom: 18 }}>
                <div className="test-passage">
                  <span className="jp" style={{ lineHeight: 1.9 }}>{pas.passage}</span>
                  {mode === 'review' && pas.passage_en && (
                    <p className="test-explain" style={{ marginTop: 8 }}>{pas.passage_en}</p>
                  )}
                </div>
                {(pas.questions ?? []).map((q: any, qi: number) => (
                  <MCQuestion key={qi} q={q} num={qi + 1} id={`p${pi}-x${xi}-q${qi}`} mode={mode} answers={answers} onAnswer={onAnswer} />
                ))}
              </div>
            ))
          ) : part.key === 'speaking' ? (
            (part.prompts ?? []).map((pr: any, qi: number) => (
              <div className="test-q" key={qi}>
                <p className="test-q-text">
                  <span className="test-q-num">{qi + 1}</span>
                  <span className="jp" style={{ fontWeight: 600 }}>{pr.prompt_jp}</span>
                </p>
                <p className="test-explain" style={{ marginTop: 2 }}>{pr.prompt_en}</p>
                {pr.hint && <p className="test-hint">💡 {pr.hint}</p>}
              </div>
            ))
          ) : (
            (part.questions ?? []).map((q: any, qi: number) =>
              q.type === 'fill_blank'
                ? <GapQuestion key={qi} q={q} num={qi + 1} id={`p${pi}-q${qi}`} mode={mode} answers={answers} onAnswer={onAnswer} />
                : <MCQuestion key={qi} q={q} num={qi + 1} id={`p${pi}-q${qi}`} mode={mode} answers={answers} onAnswer={onAnswer} />
            )
          )}
        </div>
      ))}
    </div>
  )
}
