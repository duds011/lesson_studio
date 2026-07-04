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
      {/* ── Files from teacher ── */}
      <div className="lesson-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{role === 'teacher' ? '📎 Files for the student' : '📎 Files from your teacher'}</h3>
          {role === 'teacher' && <TeacherFileUpload lessonId={lessonId} />}
        </div>
        {files.length === 0 ? (
          <p className="analytics-note" style={{ margin: 0 }}>
            {role === 'teacher' ? 'No files shared yet. Upload a presentation or PDF for this lesson.' : 'No files shared for this lesson yet.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {files.map((f) => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-2)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {f.file_name || 'file'}</span>
                <a className="btn btn-ghost btn-sm" href={`/api/portal/download?kind=file&id=${f.id}`} target="_blank" rel="noopener">Download</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Student audio ── */}
      <div className="lesson-block">
        <h3 style={{ margin: '0 0 4px' }}>{role === 'teacher' ? '🎙️ Student audio submissions' : '🎙️ Your audio submissions'}</h3>
        <p className="analytics-note" style={{ margin: '0 0 14px' }}>
          {role === 'teacher'
            ? 'Recordings this student submitted for the lesson.'
            : 'Record or upload audio to practice out loud — your teacher will hear it.'}
        </p>

        {role === 'student' && (
          <div style={{ marginBottom: audios.length ? 18 : 0 }}>
            <StudentAudioUpload lessonId={lessonId} />
          </div>
        )}

        {audios.length === 0 ? (
          role === 'teacher' && <p className="analytics-note" style={{ margin: 0 }}>No audio submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {audios.map((a) => (
              <div key={a.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, background: 'var(--surface-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{a.file_name || 'recording'}</span>
                  <span>{formatDateShort(a.created_at)}</span>
                </div>
                <audio controls preload="none" style={{ width: '100%', height: 40 }} src={`/api/portal/download?kind=audio&id=${a.id}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
