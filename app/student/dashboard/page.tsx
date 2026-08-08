import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateShort, lessonBlurb, lessonDisplayTitle, ordinal } from '@/lib/portal-utils'
import { PillarLesson } from '@/components/portal/LessonPillar'
import { DashboardBlock, DASHBOARD_LAYOUT, blockHasContent, type DashboardData } from '@/components/portal/DashboardBlocks'
import DashboardTabs from '@/components/portal/DashboardTabs'
import { DASH_BLOCK_TAB, DASH_TABS, resolveBrand, type DashTab } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/student/dashboard')

  const { data: student } = await supabase.from('students').select('*').eq('profile_id', user.id).single()

  if (!student) {
    return (
      <div className="k-empty">
        <p style={{ fontSize: 34, margin: '0 0 8px' }}>⏳</p>
        <strong style={{ color: 'var(--ink)' }}>Account not linked yet</strong>
        <br />
        Ask your teacher to link your account.
      </div>
    )
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id, lesson_number, lesson_date, title,
      lesson_summaries ( score, talk_percentage, recap, recap_json, vocab_level_distribution, vocab_total_count ),
      vocabulary_items ( id, jlpt_level )
    `)
    .eq('student_id', student.id)
    .eq('status', 'published')
    .order('lesson_number', { ascending: false })

  const rows = (lessons || []) as any[]
  const summaryOf = (l: any) => (Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries)

  const lessonCount = rows.reduce((max, l) => Math.max(max, l.lesson_number ?? 0), 0)
  const scores = rows.map((l) => summaryOf(l)?.score).filter((s) => s != null) as number[]
  const latestScore = scores[0] ?? null
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const firstScore = scores[scores.length - 1]
  const scoreDeltaNum = latestScore != null && firstScore != null ? latestScore - firstScore : null

  const talks = rows.map((l) => summaryOf(l)?.talk_percentage).filter((t) => t != null) as number[]
  const latestTalk = talks[0] ?? null
  const firstTalk = talks[talks.length - 1] ?? null
  const talkDelta = latestTalk != null && firstTalk != null ? latestTalk - firstTalk : null

  // Lessons in the last 30 days — drives the "new lessons" chip.
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentCount = rows.filter((l) => l.lesson_date && new Date(l.lesson_date).getTime() >= cutoff).length

  const metricAvg = (key: string) => {
    const vals = rows.map((l) => summaryOf(l)?.recap_json?.metrics?.[key]).filter((v) => typeof v === 'number') as number[]
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const avgWpm = metricAvg('studentWpm')
  const avgThinkSec = metricAvg('avgResponseSec')

  const vocabDistribution: Record<string, number> = {}
  for (const l of rows) {
    const dist = summaryOf(l)?.vocab_level_distribution
    if (dist && typeof dist === 'object') {
      for (const [level, count] of Object.entries(dist)) {
        vocabDistribution[level] = (vocabDistribution[level] ?? 0) + (count as number)
      }
    }
  }
  const totalVocab = Object.values(vocabDistribution).reduce((sum, n) => sum + n, 0)

  const { data: tests } = await supabase
    .from('tests')
    .select('id, title, level, published_at, lessons ( lesson_number )')
    .eq('student_id', student.id)
    .order('published_at', { ascending: false })

  // Attempts for those tests, newest first. Fetched as one list rather than per
  // test so the card can show a score without N queries; the newest row per
  // test_id wins, which is what `bestByTest` below picks out.
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('test_id, score, correct, total, submitted_at')
    .eq('student_id', student.id)
    .order('submitted_at', { ascending: false })

  const latestAttempt = new Map<string, { score: number; correct: number; total: number; submitted_at: string }>()
  for (const a of (attempts ?? []) as any[]) {
    if (!latestAttempt.has(a.test_id)) latestAttempt.set(a.test_id, a)
  }

  /**
   * Every word this student has met, with the lesson it came from.
   *
   * RLS already limits these rows to their own published lessons. Words live
   * as rows (not only inside each recap's JSON) precisely so this question —
   * when did I first see this, and has it come back — can be asked across
   * lessons at all.
   */
  const { data: vocabRows } = await supabase
    .from('vocabulary_items')
    .select('word, reading, definition, jlpt_level, is_key, lessons!inner ( lesson_number, lesson_date )')
    .order('sort_order', { ascending: true })

  // Teacher-shared files across every lesson — the Files tab. RLS only returns
  // rows for this student.
  const { data: attachments } = await supabase
    .from('lesson_attachments')
    .select('id, file_name, created_at, content_type, lesson_id, lessons ( lesson_number, lesson_date )')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  const admin = createAdminClient()
  // Credits, payment methods and buyable packages used to be fetched here for
  // the two panels above the tabs. The student portal is about the learning, so
  // those panels are gone and the queries with them.
  const { data: teacherProfile } = await admin
    .from('profiles').select('brand').eq('id', student.teacher_id).single()
  const brand = resolveBrand((teacherProfile as any)?.brand)

  // The pillar reads earliest lesson first — `rows` comes back newest first.
  const pillarLessons: PillarLesson[] = rows
    .slice()
    .reverse()
    .map((lesson) => {
      const s = summaryOf(lesson)
      return {
        id: lesson.id as string,
        number: lesson.lesson_number as number,
        title: lessonDisplayTitle(s?.recap_json, lesson.title, lesson.lesson_number),
        desc: lessonBlurb(s?.recap_json),
        meta: `${ordinal(lesson.lesson_number)} lesson · ${formatDateShort(lesson.lesson_date)}`,
        score: s?.score != null ? Number(s.score) : null,
        tag: `Lesson ${lesson.lesson_number}`,
      }
    })

  /**
   * One entry per distinct word, attributed to the lesson it FIRST appeared
   * in. A word taught again in a later lesson is not a new word — it is the
   * same word met again, which is worth showing but must not be counted twice.
   */
  const vocabByWord = new Map<string, {
    word: string; reading: string | null; definition: string | null; level: string | null
    isKey: boolean; firstLessonNumber: number | null; firstDate: string | null; lessonCount: number
  }>()
  for (const row of ((vocabRows ?? []) as any[])) {
    const lesson = Array.isArray(row.lessons) ? row.lessons[0] : row.lessons
    const word = String(row.word ?? '').trim()
    if (!word) continue
    const key = word.toLocaleLowerCase()
    const num = lesson?.lesson_number ?? null
    const existing = vocabByWord.get(key)
    if (!existing) {
      vocabByWord.set(key, {
        word,
        reading: row.reading ?? null,
        definition: row.definition ?? null,
        level: row.jlpt_level ?? null,
        isKey: Boolean(row.is_key),
        firstLessonNumber: num,
        firstDate: lesson?.lesson_date ?? null,
        lessonCount: 1,
      })
      continue
    }
    existing.lessonCount += 1
    // A word shown in full on any lesson keeps its detail here.
    if (row.is_key && !existing.isKey) {
      existing.isKey = true
      existing.reading = row.reading ?? existing.reading
      existing.definition = row.definition ?? existing.definition
    }
    // Keep the earliest sighting, whichever order the rows arrived in.
    if (num != null && (existing.firstLessonNumber == null || num < existing.firstLessonNumber)) {
      existing.firstLessonNumber = num
      existing.firstDate = lesson?.lesson_date ?? existing.firstDate
    }
  }
  // Collected with forEach rather than spreading the map: this project targets
  // ES5, where iterating a Map needs downlevelIteration.
  const vocabWords: {
    word: string; reading: string | null; definition: string | null; level: string | null
    isKey: boolean; firstLessonNumber: number | null; firstDate: string | null; lessonCount: number
  }[] = []
  vocabByWord.forEach((v) => vocabWords.push(v))
  vocabWords.sort(
    (a, b) => (b.firstLessonNumber ?? 0) - (a.firstLessonNumber ?? 0) || a.word.localeCompare(b.word),
  )

  /**
   * The level chart, counted from the words themselves rather than read from
   * the model's own estimate — so the number above the bar and the list below
   * it can never disagree.
   */
  const vocabLevels: Record<string, number> = {}
  for (const v of vocabWords) {
    if (!v.level) continue
    vocabLevels[v.level] = (vocabLevels[v.level] ?? 0) + 1
  }
  const leveledWords = Object.values(vocabLevels).reduce((a, b) => a + b, 0)

  const firstName = student.full_name.split(' ')[0]
  // Most recent scored lessons, oldest-first so the chart reads left to right.
  const scoreTrend = rows
    .filter((l) => summaryOf(l)?.score != null)
    .slice(0, 6)
    .reverse()
    .map((l) => ({ lesson: l.lesson_number as number, score: Number(summaryOf(l).score) }))

  /** Every fixed string on this page is the teacher's to change. */
  const L = brand.labels

  // Everything the blocks need, and nothing about how they look. The studio
  // renders the same components from the same shape with sample numbers, which
  // is what keeps a teacher's preview honest — see DashboardBlocks.
  const data: DashboardData = {
    lessonCount,
    recentCount,
    scoredCount: scores.length,
    avgScore,
    scoreDelta: scoreDeltaNum,
    latestTalk,
    talkDelta,
    pillarLessons,
    progressLessons: rows.map((l) => {
      const s = summaryOf(l)
      const dist = s?.vocab_level_distribution
      const distSum = dist && typeof dist === 'object' ? Object.values(dist).reduce((a: number, b: any) => a + Number(b), 0) : 0
      const metrics = s?.recap_json?.metrics || {}
      return {
        lessonNumber: l.lesson_number,
        score: s?.score ?? null,
        talkPct: s?.talk_percentage ?? null,
        vocabCount: s?.vocab_total_count ?? (distSum > 0 ? distSum : (l.vocabulary_items?.length ?? 0)),
        wpm: metrics.studentWpm ?? null,
        responseSec: metrics.avgResponseSec ?? null,
      }
    }),
    // Counted from the stored words, falling back to the model's estimate only
    // for lessons published before words were kept as rows.
    vocabDistribution: leveledWords > 0 ? vocabLevels : vocabDistribution,
    totalVocab: vocabWords.length || totalVocab,
    vocabWords: vocabWords.map((v) => ({ ...v, firstDate: formatDateShort(v.firstDate) })),
    scoreTrend,
    tests: ((tests ?? []) as any[]).map((t) => {
      const lesson = Array.isArray(t.lessons) ? t.lessons[0] : t.lessons
      const done = latestAttempt.get(t.id)
      return {
        id: t.id,
        title: t.title,
        level: t.level ?? null,
        lessonNumber: lesson?.lesson_number ?? null,
        date: formatDateShort(t.published_at),
        score: done?.score ?? null,
        correct: done?.correct ?? null,
        total: done?.total ?? null,
        takenOn: done ? formatDateShort(done.submitted_at) : null,
      }
    }),
    avgWpm,
    avgThinkSec,
    // Voice memos are audio attachments that live on their lesson's recap —
    // the Files tab is for documents.
    files: ((attachments ?? []) as any[])
      .filter((f) => !(f.content_type ?? '').startsWith('audio/'))
      .map((f) => {
        const lesson = Array.isArray(f.lessons) ? f.lessons[0] : f.lessons
        return {
          id: f.id,
          fileName: f.file_name,
          lessonId: f.lesson_id,
          lessonNumber: lesson?.lesson_number ?? null,
          date: formatDateShort(lesson?.lesson_date ?? f.created_at),
        }
      }),
  }

  /** The fixed arrangement, minus anything switched off or with nothing to
   *  say. The order is ours (DASHBOARD_LAYOUT); the styling is the teacher's. */
  const placed = DASHBOARD_LAYOUT.filter(({ id }) => blockHasContent(id, brand, data))
  const tabs = DASH_TABS
    .map((tab) => ({
      id: tab as DashTab,
      label: L[`tab${tab}` as 'tabOverview' | 'tabLessons' | 'tabProgress' | 'tabFiles' | 'tabTests'],
      blocks: placed.filter(({ id }) => DASH_BLOCK_TAB[id] === tab),
    }))
    .filter((t) => t.blocks.length > 0)

  return (
    <>
      {/* ── top bar ── */}
      <div className="k-top">
        <div>
          <p className="k-hello">{L.greeting}</p>
          <h1 className="k-name">{firstName}</h1>
        </div>
        {/* Nothing on the right any more. The name was already the headline
            two lines up, so repeating it in a chip said it twice; the bell had
            no notifications behind it and never opened anything. A search box
            that searched nothing went the same way earlier. */}
      </div>

      {/* One tab at a time, so the page is a screen rather than a scroll. */}
      <DashboardTabs
        tabs={tabs.map(({ id, label, blocks: placements }) => ({
          id,
          label,
          content: placements.map(({ id: blockId, w }) => (
            <div key={blockId} style={{ ['--w' as any]: w }}>
              <DashboardBlock id={blockId} brand={brand} data={data} />
            </div>
          )),
        }))}
      />
    </>
  )
}
