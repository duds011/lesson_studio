'use client'

import { useT } from '@/components/I18nProvider'
import { useEffect, useState } from 'react'

type Student = { id: string; name: string; hasLogin: boolean }

export default function LessonTools({ eventId, attendees }: { eventId: string; attendees: string[] }) {
  const t = useT()
  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<string>('')
  const [autoId, setAutoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const qs = new URLSearchParams({ eventId, attendees: attendees.join(',') })
    fetch(`/api/lesson/link?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return
        setStudents(d.students)
        setAutoId(d.autoStudentId)
        setSelected(d.linkedStudentId ?? d.autoStudentId ?? '')
      })
      .finally(() => setLoading(false))
  }, [eventId, attendees])

  async function change(studentId: string) {
    setSelected(studentId)
    setSaving(true)
    try {
      await fetch('/api/lesson/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, studentId: studentId || null }) })
    } finally { setSaving(false) }
  }

  const chosen = students.find((s) => s.id === selected)
  const inputStyle: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', background: '#fff', font: 'inherit' }

  return (
    <div style={{ display: 'grid', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line)', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{t.lessonTools.lessonIsWith}</label>
        {loading ? <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.common.loading}</span> : (
          <select value={selected} onChange={(e) => change(e.target.value)} style={inputStyle} disabled={saving}>
            <option value="">{t.lessonTools.notLinked}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}{s.id === autoId ? ' — auto-matched' : ''}{s.hasLogin ? '' : ' (no login)'}</option>
            ))}
          </select>
        )}
        {saving && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.common.saving}</span>}
      </div>
      {chosen && !chosen.hasLogin && (
        <span style={{ fontSize: 11, color: 'var(--amber)' }}>⚠️ {chosen.name} has no student login yet — they’ll see the recap once you create their login (Students → the student → Create login).</span>
      )}
      {!selected && !loading && (
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.lessonTools.hint}</span>
      )}
    </div>
  )
}
