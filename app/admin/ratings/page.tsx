import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { formatDateShort } from '@/lib/portal-utils'
import { reasonLabel } from '@/lib/ratings'

export const dynamic = 'force-dynamic'

/**
 * What students said about their recaps, sliced by the language being taught.
 *
 * By language rather than by teacher or by date, because that is the question
 * worth asking: twenty-seven languages are on the menu and almost none have
 * been checked against real audio by anyone who can read them. The student who
 * sat through the lesson can tell you whether the Russian was right; nobody
 * here can.
 *
 * 404s for non-admins, like the account list beside it — a page that answers
 * "forbidden" has admitted it exists.
 */
const COLS = 'minmax(120px,1fr) 80px 90px'

export default async function AdminRatingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fadmin%2Fratings')
  if (!isAdminEmail(user.email)) notFound()

  const admin = createAdminClient()

  const { data: rows } = await admin
    .from('recap_ratings')
    .select('matched, reasons, note, created_at, lesson_id')
    .order('created_at', { ascending: false })
    .limit(500)

  const ratings = (rows ?? []) as any[]
  const lessonIds = Array.from(new Set(ratings.map((r) => r.lesson_id)))

  const { data: lessons } = lessonIds.length
    ? await admin
        .from('lessons')
        .select('id, lesson_number, title, students ( full_name, language )')
        .in('id', lessonIds)
    : { data: [] as any[] }

  const lessonOf = new Map(((lessons ?? []) as any[]).map((l) => [l.id, l]))
  const studentOf = (lessonId: string) => {
    const l: any = lessonOf.get(lessonId)
    return Array.isArray(l?.students) ? l.students[0] : l?.students
  }
  const langOf = (lessonId: string) => String(studentOf(lessonId)?.language || 'Unknown')

  const total = ratings.length
  const matched = ratings.filter((r) => r.matched).length

  const byLanguage = new Map<string, { n: number; ok: number }>()
  for (const r of ratings) {
    const row = byLanguage.get(langOf(r.lesson_id)) ?? { n: 0, ok: 0 }
    row.n += 1
    if (r.matched) row.ok += 1
    byLanguage.set(langOf(r.lesson_id), row)
  }

  const byReason = new Map<string, number>()
  for (const r of ratings) {
    for (const k of (r.reasons ?? []) as string[]) byReason.set(k, (byReason.get(k) ?? 0) + 1)
  }

  const pct = (ok: number, n: number) => (n ? Math.round((ok / n) * 100) : 0)

  return (
    <main className="wrap page-fade" style={{ maxWidth: 980, padding: '32px 24px 80px' }}>
      <header style={{ marginBottom: 22 }}>
        <span className="eyebrow">Admin</span>
        <h1 style={{ marginTop: 6 }}>What students said</h1>
        <p className="sub">
          {total === 0
            ? 'No recap has been rated yet.'
            : `${matched} of ${total} recaps confirmed as accurate by the student who was in the lesson.`}
        </p>
      </header>

      {total > 0 && (
        <>
          <section className="k-sec" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', margin: 0 }}>
              {pct(matched, total)}%
            </p>
            <p className="desc" style={{ margin: '2px 0 0' }}>matched their lesson</p>
          </section>

          <section className="k-sec" style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>By language</h3>
            <p className="desc" style={{ margin: '4px 0 0' }}>
              The languages nobody here can check are the rows that matter.
            </p>
            <div className="k-table" style={{ marginTop: 14 }}>
              <div className="k-table-head" style={{ gridTemplateColumns: COLS }}>
                <span>Language</span><span>Rated</span><span>Matched</span>
              </div>
              {Array.from(byLanguage.entries())
                .sort((a, b) => b[1].n - a[1].n)
                .map(([lang, v]) => (
                  <div key={lang} className="k-row" style={{ gridTemplateColumns: COLS }}>
                    <span style={{ fontWeight: 700 }}>{lang}</span>
                    <span style={{ fontSize: 12 }}>{v.n}</span>
                    <span style={{ fontSize: 12 }}>{pct(v.ok, v.n)}%</span>
                  </div>
                ))}
            </div>
          </section>

          {byReason.size > 0 && (
            <section className="k-sec" style={{ marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>What went wrong</h3>
              <div className="k-table" style={{ marginTop: 14 }}>
                <div className="k-table-head" style={{ gridTemplateColumns: 'minmax(180px,1fr) 80px' }}>
                  <span>Reason</span><span>Times</span>
                </div>
                {Array.from(byReason.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, n]) => (
                    <div key={k} className="k-row" style={{ gridTemplateColumns: 'minmax(180px,1fr) 80px' }}>
                      <span style={{ fontWeight: 700 }}>{reasonLabel(k)}</span>
                      <span style={{ fontSize: 12 }}>{n}</span>
                    </div>
                  ))}
              </div>
            </section>
          )}

          <section className="k-sec">
            <h3 style={{ marginTop: 0 }}>Every answer</h3>
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              {ratings.map((r, i) => {
                const l: any = lessonOf.get(r.lesson_id)
                const s = studentOf(r.lesson_id)
                return (
                  <div key={i} style={{ borderTop: '1px solid var(--line)', paddingTop: 11 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5 }}>
                      {r.matched ? 'Matched' : 'Off'} · {langOf(r.lesson_id)}
                      {s?.full_name ? ` · ${s.full_name}` : ''}
                      {l ? ` · Lesson ${l.lesson_number ?? '?'}` : ''}
                    </p>
                    {!r.matched && (r.reasons ?? []).length > 0 && (
                      <p className="desc" style={{ margin: '4px 0 0' }}>
                        {(r.reasons as string[]).map(reasonLabel).join(' · ')}
                      </p>
                    )}
                    {r.note && <p style={{ margin: '6px 0 0', fontSize: 13.5 }}>&ldquo;{r.note}&rdquo;</p>}
                    <p className="desc" style={{ margin: '5px 0 0', fontSize: 11.5 }}>
                      {formatDateShort(r.created_at)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
