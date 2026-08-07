import { formatDateShort } from '@/lib/portal-utils'
import TeacherVoiceMemo from '@/components/portal/TeacherVoiceMemo'
import AudioPlayer from '@/components/portal/AudioPlayer'

type Row = { id: string; file_name: string | null; created_at: string; content_type?: string | null }

/** Teacher voice memos are audio attachments; documents are everything else. */
export const isMemo = (f: Row) => (f.content_type ?? '').startsWith('audio/')

/**
 * The teacher talking to this student about this lesson.
 *
 * It opens the recap because it is the one part written for them personally —
 * everything else on the page is measurement. A student with no memo sees
 * nothing at all rather than an empty panel explaining what is missing.
 */
export default function LessonMemo({
  memos, lessonId, role, teacherFirst = 'Your teacher',
}: {
  memos: Row[]
  lessonId: string
  role: 'teacher' | 'student'
  teacherFirst?: string
}) {
  if (role === 'student' && memos.length === 0) return null

  const players = memos.map((m) => (
    <AudioPlayer
      key={m.id}
      src={`/api/portal/download?kind=file&id=${m.id}`}
      title={m.file_name || 'Voice memo'}
      meta={formatDateShort(m.created_at)}
    />
  ))

  if (role === 'student') {
    return (
      <div className="lesson-block">
        <h3>💬 A message from {teacherFirst}</h3>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>{players}</div>
      </div>
    )
  }

  return (
    <div className="lesson-block">
      <h3>🎙️ Voice memo</h3>
      <p className="analytics-note" style={{ margin: '0 0 12px' }}>
        A quick spoken note for this lesson. It opens the student&rsquo;s recap; record nothing and they see nothing.
      </p>
      <TeacherVoiceMemo lessonId={lessonId} />
      {players.length > 0 && <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>{players}</div>}
    </div>
  )
}
