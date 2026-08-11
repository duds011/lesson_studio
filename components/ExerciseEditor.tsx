'use client'

/**
 * Editing the generated exercises during recap review.
 *
 * The generator writes them; the teacher gets the red pen. Every text the
 * student will see is an input here — including the instruction line above
 * each exercise — the right answer is picked rather than typed (a radio can't
 * disagree with the option list), and any exercise can be dropped. When the
 * generated set isn't to taste, the teacher can also write her own from a
 * blank of any type.
 */

type Exercise = { type: string; prompt: string; data: any }

const TYPE_LABEL: Record<string, string> = {
  read_aloud: '🎙️ Read aloud',
  speak: '🗣️ Speaking',
  multiple_choice: '✅ Multiple choice',
  fill_blank: '✏️ Fill in the blank',
}

// Blank exercises for "+ Add" — same shapes the generator emits, with the
// prompt prefilled to its usual instruction so only the material is left to write.
const TEMPLATES: Record<string, Exercise> = {
  read_aloud: { type: 'read_aloud', prompt: 'Read these sentences aloud', data: { focus: '', sentences: [{ jp: '', en: '' }] } },
  speak: { type: 'speak', prompt: 'Answer out loud', data: { prompt_jp: '', prompt_en: '', hint: '' } },
  multiple_choice: { type: 'multiple_choice', prompt: 'Quick check', data: { question: '', options: ['', '', ''], answer: 0 } },
  fill_blank: { type: 'fill_blank', prompt: 'Fill in the blank', data: { before: '', after: '', options: ['', '', ''], answer: '', en: '' } },
}

// The update endpoint keeps at most 20; don't let the editor build more.
const MAX_EXERCISES = 20

const input: React.CSSProperties = {
  border: '1px solid var(--line)', borderRadius: 8, padding: '7px 10px',
  background: '#fff', width: '100%', font: 'inherit', fontSize: 13,
}
const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }

export default function ExerciseEditor({ exercises, onChange }: {
  exercises: Exercise[]
  onChange: (next: Exercise[]) => void
}) {
  const patch = (i: number, next: Partial<Exercise>) =>
    onChange(exercises.map((e, j) => (j === i ? { ...e, ...next } : e)))
  const patchData = (i: number, data: any) => patch(i, { data: { ...exercises[i].data, ...data } })
  const remove = (i: number) => onChange(exercises.filter((_, j) => j !== i))
  const add = (type: string) => onChange([...exercises, structuredClone(TEMPLATES[type])])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {exercises.length === 0 && <p className="analytics-note">No exercises yet — add your own below.</p>}
      {exercises.map((ex, i) => (
        <div key={i} className="ex-card" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="ex-tag">{TYPE_LABEL[ex.type] ?? ex.type}</span>
            <button
              type="button"
              className="btn btn-danger-ghost btn-sm"
              style={{ padding: '3px 9px', fontSize: 11 }}
              onClick={() => remove(i)}
              aria-label={`Remove exercise ${i + 1}`}
            >
              Remove
            </button>
          </div>

          {/* Speaking exercises show their instruction line to the student;
              the graded types already edit it as the question. */}
          {(ex.type === 'read_aloud' || ex.type === 'speak') && (
            <div style={{ marginBottom: 8 }}><span style={label}>Instruction</span>
              <input style={input} value={ex.prompt ?? ''} onChange={(e) => patch(i, { prompt: e.target.value })} placeholder="What the student is asked to do" /></div>
          )}

          {ex.type === 'read_aloud' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div><span style={label}>Focus</span>
                <input style={input} value={ex.data?.focus ?? ''} onChange={(e) => patchData(i, { focus: e.target.value })} placeholder="What the sentences drill" /></div>
              {(ex.data?.sentences ?? []).map((s: any, si: number) => (
                <div key={si} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6 }}>
                  <input style={input} value={s.jp ?? ''} onChange={(e) => {
                    const sentences = [...ex.data.sentences]; sentences[si] = { ...s, jp: e.target.value }; patchData(i, { sentences })
                  }} placeholder="Sentence" />
                  <input style={input} value={s.en ?? ''} onChange={(e) => {
                    const sentences = [...ex.data.sentences]; sentences[si] = { ...s, en: e.target.value }; patchData(i, { sentences })
                  }} placeholder="Meaning" />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                    patchData(i, { sentences: ex.data.sentences.filter((_: any, sj: number) => sj !== si) })
                  }} aria-label="Remove sentence">✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }}
                onClick={() => patchData(i, { sentences: [...(ex.data?.sentences ?? []), { jp: '', en: '' }] })}>
                + Sentence
              </button>
            </div>
          )}

          {ex.type === 'speak' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div><span style={label}>Question (target language)</span>
                <input style={input} value={ex.data?.prompt_jp ?? ''} onChange={(e) => patchData(i, { prompt_jp: e.target.value })} /></div>
              <div><span style={label}>Meaning</span>
                <input style={input} value={ex.data?.prompt_en ?? ''} onChange={(e) => patchData(i, { prompt_en: e.target.value })} /></div>
              <div><span style={label}>Hint</span>
                <input style={input} value={ex.data?.hint ?? ''} onChange={(e) => patchData(i, { hint: e.target.value })} /></div>
            </div>
          )}

          {ex.type === 'multiple_choice' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div><span style={label}>Question</span>
                <input style={input} value={ex.data?.question ?? ex.prompt ?? ''} onChange={(e) => patchData(i, { question: e.target.value })} /></div>
              {(ex.data?.options ?? []).map((o: string, oi: number) => (
                <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name={`mc-${i}`}
                    checked={(ex.data?.answer ?? 0) === oi}
                    onChange={() => patchData(i, { answer: oi })}
                    aria-label={`Option ${oi + 1} is correct`}
                  />
                  <input style={{ ...input, flex: 1 }} value={o} onChange={(e) => {
                    const options = [...ex.data.options]; options[oi] = e.target.value; patchData(i, { options })
                  }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                    const options = ex.data.options.filter((_: string, oj: number) => oj !== oi)
                    const answer = ex.data?.answer ?? 0
                    // Deleting the correct option leaves the first as correct.
                    patchData(i, { options, answer: answer === oi ? 0 : answer > oi ? answer - 1 : answer })
                  }} aria-label="Remove option">✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => patchData(i, { options: [...(ex.data?.options ?? []), ''] })}>+ Option</button>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>The radio marks the correct answer.</span>
              </div>
            </div>
          )}

          {ex.type === 'fill_blank' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div><span style={label}>Before the gap</span>
                  <input style={input} value={ex.data?.before ?? ''} onChange={(e) => patchData(i, { before: e.target.value })} /></div>
                <div><span style={label}>After the gap</span>
                  <input style={input} value={ex.data?.after ?? ''} onChange={(e) => patchData(i, { after: e.target.value })} /></div>
              </div>
              <div><span style={label}>Meaning</span>
                <input style={input} value={ex.data?.en ?? ''} onChange={(e) => patchData(i, { en: e.target.value })} /></div>
              {(ex.data?.options ?? []).map((o: string, oi: number) => (
                <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name={`fb-${i}`}
                    checked={(ex.data?.answer ?? '') === o}
                    onChange={() => patchData(i, { answer: o })}
                    aria-label={`Option ${oi + 1} is correct`}
                  />
                  <input style={{ ...input, flex: 1 }} value={o} onChange={(e) => {
                    const options = [...ex.data.options]
                    const wasAnswer = (ex.data?.answer ?? '') === o
                    options[oi] = e.target.value
                    // Editing the correct option's text keeps it correct.
                    patchData(i, wasAnswer ? { options, answer: e.target.value } : { options })
                  }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                    const options = ex.data.options.filter((_: string, oj: number) => oj !== oi)
                    // Deleting the correct option leaves no answer picked yet.
                    patchData(i, { options, answer: (ex.data?.answer ?? '') === o ? '' : ex.data?.answer })
                  }} aria-label="Remove option">✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => patchData(i, { options: [...(ex.data?.options ?? []), ''] })}>+ Option</button>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>The radio marks the word that belongs in the gap.</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {exercises.length < MAX_EXERCISES && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ ...label, marginRight: 4 }}>Add your own</span>
          {Object.keys(TEMPLATES).map((t) => (
            <button key={t} type="button" className="btn btn-ghost btn-sm" onClick={() => add(t)}>
              + {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
