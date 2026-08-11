'use client'

/**
 * Editing the generated exercises during recap review.
 *
 * The generator writes them; the teacher gets the red pen. Every text the
 * student will see is an input here, the right answer is picked rather than
 * typed (a radio can't disagree with the option list), and any exercise can be
 * dropped. There is no "add exercise" — regenerating the recap is how you get
 * new material; this is for fixing it.
 */

type Exercise = { type: string; prompt: string; data: any }

const TYPE_LABEL: Record<string, string> = {
  read_aloud: '🎙️ Read aloud',
  speak: '🗣️ Speaking',
  multiple_choice: '✅ Multiple choice',
  fill_blank: '✏️ Fill in the blank',
}

const input: React.CSSProperties = {
  border: '1px solid var(--line)', borderRadius: 8, padding: '7px 10px',
  background: '#fff', width: '100%', font: 'inherit', fontSize: 13,
}
const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }

export default function ExerciseEditor({ exercises, onChange }: {
  exercises: Exercise[]
  onChange: (next: Exercise[]) => void
}) {
  if (exercises.length === 0) {
    return <p className="analytics-note">No exercises were generated for this lesson.</p>
  }

  const patch = (i: number, next: Partial<Exercise>) =>
    onChange(exercises.map((e, j) => (j === i ? { ...e, ...next } : e)))
  const patchData = (i: number, data: any) => patch(i, { data: { ...exercises[i].data, ...data } })
  const remove = (i: number) => onChange(exercises.filter((_, j) => j !== i))

  return (
    <div style={{ display: 'grid', gap: 12 }}>
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
                </div>
              ))}
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>The radio marks the correct answer.</span>
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
                </div>
              ))}
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>The radio marks the word that belongs in the gap.</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
