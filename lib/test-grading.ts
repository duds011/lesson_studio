/**
 * Grading for practice tests, shared by the page the student takes and the
 * server action that records the result.
 *
 * It has to be one function. The student watches a running score while they
 * answer, and that number becomes their saved result — if the client and the
 * server disagree by even one question, the score they saw is not the score
 * they got, and there is no way for them to tell which is wrong.
 *
 * The server never trusts the client's arithmetic: it receives the answers and
 * re-grades them against the test's own key.
 */

export type Answers = Record<string, number | string>

export type Gradeable = { id: string; correct: number | string }

/**
 * Every gradeable question, keyed exactly as TestView keys its inputs.
 *
 * Speaking parts are excluded — they have no machine-checkable answer, so
 * counting them would cap every score below 100 for no reason.
 */
export function gradeableQuestions(test: any): Gradeable[] {
  const parts: any[] = Array.isArray(test?.parts) ? test.parts : []
  const list: Gradeable[] = []

  parts.forEach((part, pi) => {
    if (part.key === 'reading') {
      ;(part.passages ?? []).forEach((passage: any, xi: number) => {
        ;(passage.questions ?? []).forEach((q: any, qi: number) =>
          list.push({ id: `p${pi}-x${xi}-q${qi}`, correct: q.answer }),
        )
      })
    } else if (part.key !== 'speaking') {
      ;(part.questions ?? []).forEach((q: any, qi: number) =>
        list.push({ id: `p${pi}-q${qi}`, correct: q.answer }),
      )
    }
  })

  return list
}

/**
 * Whether one answer is right.
 *
 * Multiple choice is an index and compares exactly. A typed answer is compared
 * on trimmed, case-folded text: a fill-in-the-blank marked wrong for a capital
 * letter or a trailing space is a bug in the marking, not an error by the
 * student.
 */
export function isCorrect(given: number | string | undefined, expected: number | string): boolean {
  if (given === undefined) return false
  if (typeof expected === 'string' || typeof given === 'string') {
    return String(given).trim().toLowerCase() === String(expected).trim().toLowerCase()
  }
  return given === expected
}

export type Grade = { correct: number; total: number; answered: number; score: number }

/** Score as a whole percentage of every gradeable question, not just answered ones. */
export function gradeTest(test: any, answers: Answers): Grade {
  const gradeable = gradeableQuestions(test)
  const answered = gradeable.filter((g) => answers[g.id] !== undefined).length
  const correct = gradeable.filter((g) => isCorrect(answers[g.id], g.correct)).length
  const total = gradeable.length
  return { correct, total, answered, score: total ? Math.round((correct / total) * 100) : 0 }
}
