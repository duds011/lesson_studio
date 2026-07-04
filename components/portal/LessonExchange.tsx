import { formatDateShort } from '@/lib/portal-utils'
import TeacherFileUpload from '@/components/portal/TeacherFileUpload'
import StudentAudioUpload from '@/components/portal/StudentAudioUpload'

type Row = { id: string; file_name: string | null; created_at: string }

/**
 * Two-way content exchange for a lesson:
 *  - Teacher shares files (presentations, PDFs) → student downloads
 *  - Student submits audio recordings → teacher listens
 */
export default function LessonExchange({
  lessonId,
  role,
  files,
  audios,
}: {
  lessonId: string
  role: 'teacher' | 'student'
  files: Row[]
  audios: Row[]
}) {
  return (
    <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
      {/* Files from teacher */}
      <div className="lesson-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{role === 'teacher' ? '📎 Files for the student' : '📎 Files from your teacher'}</h3>
          {role === 'teacher' && <TeacherFileUpload lessonId={lessonId} />}
        </div>
        {files.length === 0 ? (
          <p className="analytics-note" style={{ margin: 0 }}>
            {role === 'teacher' ? 'No files shared yet. Upload a presentation or PDF for this lesson.' : 'No files shared for this lesson yet.'}
          </p>
        ) : (
          <ul className="fc-list" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            {files.map((f) => (
              <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <a className="btn btn-ghost btn-sm" href={`/api/portal/download?kind=file&id=${f.id}`} target="_blank" rel="noopener">⬇ {f.file_name || 'file'}</a>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>{formatDateShort(f.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Student audio submissions */}
      <div className="lesson-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{role === 'teacher' ? '🎙️ Student audio submissions' : '🎙️ Your audio submissions'}</h3>
          {role === 'student' && <StudentAudioUpload lessonId={lessonId} />}
        </div>
        {audios.length === 0 ? (
          <p className="analytics-note" style={{ margin: 0 }}>
            {role === 'teacher' ? 'No audio submitted yet.' : 'Record or upload an audio to practice out loud — your teacher will hear it.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {audios.map((a) => (
              <div key={a.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                  <span>{a.file_name || 'recording'}</span>
                  <span>{formatDateShort(a.created_at)}</span>
                </div>
                <audio controls preload="none" style={{ width: '100%', height: 38 }} src={`/api/portal/download?kind=audio&id=${a.id}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
