'use client'

import { useState } from 'react'
import { levelScale } from './portal/VocabLevelBreakdown'

export type LessonView = {
  id: string
  title: string
  start: string
  end: string
  tz: string
  platform: 'meet' | 'zoom' | 'other'
  meetingUrl: string | null
  attendees?: string[]
}

const PLAT: Record<LessonView['platform'], { label: string; color: string }> = {
  meet: { label: 'Google Meet', color: '#00832d' },
  zoom: { label: 'Zoom', color: '#2D8CFF' },
  other: { label: 'Other', color: '#6b7280' },
}

function fmtTime(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz })
}
function fmtDur(start: string, end: string) {
  const m = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return m > 0 ? `${m} min` : ''
}
// Best-effort student name from the event title.
function studentName(title: string) {
  const clean = title.replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
  if (clean.includes(' — ')) return clean.split(' — ').pop()!.trim()
  const paired = clean.match(/^(?:\d+:\d+\s+)?(.+?)\s+(?:and|with)\s+.+$/i)
  if (paired) return paired[1].trim()
  return clean
}

export default function LessonRow({
  lesson, initialRecapStatus,
}: {
  lesson: LessonView
  initialRecapStatus: 'draft' | 'published' | null
}) {
  const [recap, setRecap] = useState<any>(null)
  const [recapStatus, setRecapStatus] = useState<'draft' | 'published' | null>(initialRecapStatus)
  const [open, setOpen] = useState(false)

  async function openRecap() {
    if (!recap) {
      try {
        const j = await (await fetch(`/api/recap?eventId=${encodeURIComponent(lesson.id)}`)).json()
        if (j.ok) { setRecap(j.recap); setRecapStatus(j.status) }
      } catch {}
    }
    setOpen(true)
  }

  async function publish() {
    await fetch('/api/recap', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: lesson.id }),
    })
    setRecapStatus('published'); setOpen(false)
  }

  const p = PLAT[lesson.platform]

  return (
    <>
      <div className="lesson-row">
        <div className="lesson-time">
          <div>{fmtTime(lesson.start, lesson.tz)}</div>
          <small>{fmtDur(lesson.start, lesson.end)}</small>
        </div>
        <div>
          <div className="lesson-title" dangerouslySetInnerHTML={{ __html: lesson.title }} />
          <div className="lesson-meta-text">
            <span className="plat" style={{ color: p.color }}>● {p.label}</span>
            {lesson.meetingUrl
              ? <span title={lesson.meetingUrl}>· {lesson.meetingUrl.replace(/^https?:\/\//, '').slice(0, 30)}…</span>
              : <span>· no meeting link</span>}
          </div>
        </div>
        <div className="lesson-actions">
          {lesson.meetingUrl && (
            <a className="btn btn-primary btn-sm" href={lesson.meetingUrl} target="_blank" rel="noreferrer">Join call ↗</a>
          )}
          {recapStatus === 'published' ? (
            <button className="btn btn-ghost btn-sm" onClick={openRecap}>View recap</button>
          ) : recapStatus === 'draft' ? (
            <button className="btn btn-primary btn-sm" onClick={openRecap}>Review recap</button>
          ) : !lesson.meetingUrl ? (
            <span className="pill amber"><span className="dot" />No link</span>
          ) : null}
        </div>
      </div>

      {open && recap && (
        <RecapDrawer
          title={studentName(lesson.title)}
          recap={recap}
          status={recapStatus}
          onClose={() => setOpen(false)}
          onPublish={publish}
        />
      )}
    </>
  )
}

/* ── Formatted-content renderer (ported from teacher-portal SectionContent) ── */
function hasJapanese(t: string) { return /[　-ヿ㐀-鿿＀-￯]/.test(t) }
function isRomajiLine(t: string) {
  const s = t.replace(/\*\*?.+?\*\*?/g, '').trim()
  return /^[a-z][a-z\s.,\-'!?()ā-žāīūēōãñ]*$/i.test(s) && s.length > 0 && !hasJapanese(t)
}
function isPureJapanese(t: string) {
  if (!hasJapanese(t)) return false
  return !/[a-zA-Z]/.test(t.replace(/\*\*[^*]+\*\*/g, ''))
}
function inline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  if (parts.length === 1) return text
  return <>{parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>))}</>
}
function FormattedContent({ content }: { content: any }) {
  let text = content
  if (Array.isArray(text)) text = text.join('\n\n')
  if (typeof text !== 'string' || !text.trim()) return null
  return (
    <>
      {text.split(/\n\n+/).map((block, bi) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
        if (!lines.length) return null
        const first = lines[0]
        if (/^(natural note|teacher note|important word order|important|note):/i.test(first)) {
          return <p key={bi} className="callout">{lines.map((l, i) => <span key={i}>{i > 0 && <br />}{inline(l)}</span>)}</p>
        }
        if (lines.every((l) => /^[-•→]/.test(l))) {
          return <ul key={bi} className="fc-list">{lines.map((l, i) => <li key={i}>{inline(l.replace(/^[-•→]\s*/, ''))}</li>)}</ul>
        }
        if (lines.some((l) => hasJapanese(l))) {
          return (
            <div key={bi} className="ex">
              {lines.map((l, i) =>
                isPureJapanese(l) ? <p key={i} className="jp" style={{ margin: '.1rem 0' }}>{l}</p>
                  : isRomajiLine(l) ? <p key={i} className="romaji" style={{ margin: '.1rem 0' }}>{l}</p>
                    : <p key={i} style={{ margin: '.1rem 0', fontSize: '.9rem' }}>{inline(l)}</p>
              )}
            </div>
          )
        }
        return <p key={bi} style={{ fontSize: '.9rem', margin: '.3rem 0' }}>{lines.map((l, i) => <span key={i}>{i > 0 && <br />}{inline(l)}</span>)}</p>
      })}
    </>
  )
}

function RecapDrawer({ title, recap, status, onClose, onPublish }: {
  title: string; recap: any; status: 'draft' | 'published' | null; onClose: () => void; onPublish: () => void
}) {
  const dist: Record<string, number> = recap.vocab_level_distribution || {}
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${title} lesson recap review`}>
        <div className="drawer-head">
          <div><span className="eyebrow">Review before publishing</span><h3>{title} · Lesson recap</h3></div>
          <button className="close-btn" onClick={onClose} aria-label="Close recap review">×</button>
        </div>
        <div className="drawer-body">
          {status === 'draft' && <div className="review-banner">AI draft — review the content below before it reaches the student.</div>}

          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <div className="mini"><div className="k">Score</div><div className="v">{recap.score}</div></div>
            <div className="mini"><div className="k">Student talk</div><div className="v">{recap.talk_percentage}%</div></div>
            <div className="mini"><div className="k">Grammar</div><div className="v" style={{ fontSize: '.85rem', paddingTop: '.4rem' }}>{recap.grammar_density}</div></div>
            <div className="mini"><div className="k">Confidence</div><div className="v" style={{ fontSize: '.85rem', paddingTop: '.4rem' }}>{recap.confidence_label}</div></div>
          </div>

          {/* full formatted recap */}
          <div className="block"><FormattedContent content={recap.recap} /></div>

          {/* sections */}
          {(recap.sections || []).map((s: any, i: number) => (
            <div className="block" key={i}>
              <h4>{s.title}</h4>
              <FormattedContent content={s.content} />
            </div>
          ))}

          {/* vocabulary with JLPT */}
          {recap.vocabulary?.length > 0 && (
            <div className="block">
              <h4>Vocabulary {recap.vocab_total_count ? `· ${recap.vocab_total_count} items` : ''}</h4>
              {/* Scale follows the language, not always Japanese. */}
              {Object.keys(dist).length > 0 && (
                <div className="jlpt-row">{levelScale(dist).map((lv) => <span key={lv} className="jlpt">{lv}: {dist[lv] ?? 0}</span>)}</div>
              )}
              <ul className="fc-list">
                {recap.vocabulary.map((v: any, i: number) => (
                  <li key={i}>
                    <span className="jp">{v.word}</span> <span className="romaji">{v.reading}</span> — {v.definition}
                    {v.jlpt_level && <span className="jlpt sm"> {v.jlpt_level}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* homework — Array.isArray, not .length: a string has a length and
              then throws on .map. Same fix as LessonPageTabs. */}
          {Array.isArray(recap.homework) && recap.homework.length > 0 && (
            <div className="block">
              <h4>Homework</h4>
              <ul className="fc-list">{recap.homework.map((h: any, i: number) => <li key={i}>{h?.description ?? String(h)}</li>)}</ul>
            </div>
          )}

          {/* interactive exercises */}
          {recap.exercises?.length > 0 && (
            <div className="block">
              <h4>Practice exercises ({recap.exercises.length})</h4>
              <ul className="fc-list">
                {recap.exercises.map((e: any, i: number) => (
                  <li key={i}><strong>{e.type}</strong> — {e.prompt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* audio script */}
          {recap.audio_script && (
            <div className="block">
              <h4>Voice memo script</h4>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '.88rem' }}>{recap.audio_script}</p>
            </div>
          )}

          {recap.teacher_note && (
            <div className="block"><h4>Teacher’s note</h4><p>{recap.teacher_note}</p></div>
          )}
          <div style={{ fontSize: '.76rem', color: 'var(--muted)', textAlign: 'center', padding: '.5rem' }}>
            Source: extension recording → Whisper transcript → OpenAI (gpt-4.1) recap
          </div>
        </div>
        <div className="drawer-foot">
          {status === 'draft' ? (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Edit later</button>
              <button className="btn btn-green" onClick={onPublish}>Approve &amp; send to student</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          )}
        </div>
      </aside>
    </>
  )
}
