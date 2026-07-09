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
  const audioList = audios.length > 0 && (
    <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
      {audios.map((a) => (
        <div key={a.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 10, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>{a.file_name || 'recording'}</span>
            <span>{formatDateShort(a.created_at)}</span>
          </div>
          <audio controls preload="none" style={{ width: '100%', height: 38 }} src={`/api/portal/download?kind=audio&id=${a.id}`} />
        </div>
      ))}
    </div>
  )

  const fileList = (
    <div style={{ display: 'grid', gap: 8 }}>
      {files.map((f) => (
        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-2)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {f.file_name || 'file'}</span>
          <a className="btn btn-ghost btn-sm" href={`/api/portal/download?kind=file&id=${f.id}`} target="_blank" rel="noopener">Download</a>
        </div>
      ))}
    </div>
  )

  // ── Student view: compact audio first, teacher files only when they exist ──
  if (role === 'student') {
    return (
      <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
        <div className="lesson-block" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>🎙️ Practice audio <span style={{ color: 'var(--muted)', fontWeight: 400 }}>— record yourself, your teacher hears it</span></span>
          </div>
          <div style={{ marginTop: 10 }}><StudentAudioUpload lessonId={lessonId} /></div>
          {audioList}
        </div>

        {files.length > 0 && (
          <div className="lesson-block">
            <h3 style={{ margin: '0 0 12px' }}>📎 Files from your teacher</h3>
            {fileList}
          </div>
        )}
      </div>
    )
  }

  // ── Teacher view: full panels with empty states + upload ──
  return (
    <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
      <div className="lesson-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>📎 Files for the student</h3>
          <TeacherFileUpload lessonId={lessonId} />
        </div>
        {files.length === 0 ? (
          <p className="analytics-note" style={{ margin: 0 }}>No files shared yet. Upload a presentation or PDF for this lesson.</p>
        ) : fileList}
      </div>

      <div className="lesson-block">
        <h3 style={{ margin: '0 0 4px' }}>🎙️ Student audio submissions</h3>
        <p className="analytics-note" style={{ margin: '0 0 14px' }}>Recordings this student submitted for the lesson.</p>
        {audios.length === 0 ? <p className="analytics-note" style={{ margin: 0 }}>No audio submitted yet.</p> : audioList}
      </div>
    </div>
  )
}
