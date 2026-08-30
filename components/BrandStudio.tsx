'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveBrand } from '@/app/actions/onboarding'
import {
  DEFAULT_BRAND, BLOCK_LABELS, BLOCK_TEXT_SLOTS, BLOCK_TOGGLE,
  DASH_BLOCK_TAB, DASH_LOCKED, DASH_SPEAK_TILES, DASH_STAT_TILES, DASH_TABS, PRESETS, FONTS, TEXT_SLOTS,
  LESSON_BLOCK_HINTS, LESSON_BLOCK_LABELS, LESSON_BLOCK_TAB, LESSON_BLOCK_TOGGLE,
  LESSON_LAYOUT, LESSON_LOCKED, LESSON_TABS, RECAP_METRICS,
  brandVars, backgroundClass, MAX_LEVELS, MAX_LEVEL_LESSONS, resolveLevels,
  type Brand, type BlockId, type DashTab, type TextSlot, type LessonBlockId, type LessonTab,
  type RecapMetricId, type DashStatId, type DashSpeakId,
} from '@/lib/brand'
import LessonPageTabs from './LessonPageTabs'
import { DashboardBlock, DASHBOARD_LAYOUT, blockHasContent, type DashboardData } from './portal/DashboardBlocks'

/**
 * The canvas is a fixed page, not a fluid one: what a teacher sees has to be
 * what a student on a laptop gets. 1180 is the student portal's own content
 * width at 1280 wide, rail and padding removed. A narrow pane scales the whole
 * page down rather than reflowing it.
 */
const CANVAS_WIDTH = { desktop: 1180, mobile: 390 } as const

/** What each dashboard block puts in front of the student. */
const BLOCK_HINTS: Record<BlockId, string> = {
  stats: 'Lessons, average score, speaking share',
  lessons: 'The rolling list of their lessons',
  milestone: 'Progress toward their next level',
  scores: 'The last few lesson scores',
  progress: 'Score, talk-time and vocabulary trends',
  vocabTotals: 'How much vocabulary they have picked up',
  vocab: 'Every word, and the lesson it came from',
  flashcards: 'Practice decks, split by kind of word',
  tests: 'Tests you publish to them',
  speaking: 'Pace and thinking time',
  files: 'Every file you share, in one place',
}

/**
 * The two pages a teacher can strip back, each grouped by the tab a section
 * lands on. Grouping is the whole point: a switch means nothing until you can
 * see which tab it empties, and a tab with every section off disappears from
 * the student's page rather than opening onto nothing.
 *
 * Both lists are derived from the layouts themselves, so a section added to
 * either page shows up here without a second edit.
 */
const DASH_GROUPS = DASH_TABS.map((tab) => ({
  tab,
  ids: DASHBOARD_LAYOUT.map((b) => b.id).filter((id) => DASH_BLOCK_TAB[id] === tab && !DASH_LOCKED.has(id)),
})).filter((g) => g.ids.length > 0)

const DASH_REMOVABLE = DASHBOARD_LAYOUT.filter(({ id }) => !DASH_LOCKED.has(id))

/** Only the removable recap sections appear in the drawer — a locked section
 *  with a switch that cannot move would just be a question. */
const LESSON_GROUPS = LESSON_TABS.map((tab) => ({
  tab,
  ids: LESSON_LAYOUT.map((b) => b.id).filter((id) => LESSON_BLOCK_TAB[id] === tab && !LESSON_LOCKED.has(id)),
})).filter((g) => g.ids.length > 0)

const LESSON_REMOVABLE = LESSON_LAYOUT.filter(({ id }) => !LESSON_LOCKED.has(id))

/**
 * A believable student, so the preview is the real page with the real
 * components — not an imitation of them that can fall out of date.
 */
const SAMPLE: DashboardData = {
  lessonCount: 12,
  recentCount: 3,
  scoredCount: 9,
  avgScore: 7.4,
  scoreDelta: 1.9,
  latestTalk: 41,
  firstTalk: 30,
  decks: [
    { id: 'noun', label: 'Nouns', sub: 'things and places', tone: 'blue', total: 33, due: 12, known: 8 },
    { id: 'verb', label: 'Verbs', sub: 'actions', tone: 'green', total: 16, due: 5, known: 4 },
    { id: 'phrase', label: 'Phrases', sub: 'whole expressions', tone: 'purple', total: 18, due: 18, known: 0 },
    { id: 'adjective', label: 'Adjectives', sub: 'describing words', tone: 'amber', total: 6, due: 2, known: 1 },
  ],
  cardTotal: 73,
  cardDue: 37,
  talkDelta: 8,
  pillarLessons: [
    { id: 's3', number: 12, title: 'Contrasting ideas with けど', meta: '12th lesson · 2 Aug', score: 8.3, tag: 'Lesson 12', desc: 'Joining two ideas in one sentence, and softening a disagreement politely.' },
    { id: 's2', number: 11, title: 'Ordering at a restaurant', meta: '11th lesson · 26 Jul', score: 7.8, tag: 'Lesson 11', desc: 'Asking for a table, ordering, and checking the bill without switching to English.' },
    { id: 's1', number: 10, title: 'Talking about last weekend', meta: '10th lesson · 19 Jul', score: 6.9, tag: 'Lesson 10', desc: 'Past-tense practice: what you did, where you went, and how it was.' },
  ],
  progressLessons: [
    { lessonNumber: 12, score: 8.3, talkPct: 41, vocabCount: 14, wpm: 96, responseSec: 1.8 },
    { lessonNumber: 11, score: 7.8, talkPct: 38, vocabCount: 11, wpm: 92, responseSec: 2.1 },
    { lessonNumber: 10, score: 6.9, talkPct: 35, vocabCount: 9, wpm: 88, responseSec: 2.4 },
    { lessonNumber: 9, score: 7.1, talkPct: 33, vocabCount: 12, wpm: 84, responseSec: 2.9 },
    { lessonNumber: 8, score: 6.4, talkPct: 30, vocabCount: 8, wpm: 79, responseSec: 3.3 },
  ],
  vocabDistribution: { N5: 18, N4: 13, N3: 9, N2: 5 },
  totalVocab: 45,
  vocabWords: [
    { word: 'けど', reading: 'kedo', definition: 'But, although.', level: 'N5', firstLessonNumber: 12, firstDate: '2 Aug', lessonCount: 1 },
    { word: '静か', reading: 'shizuka', definition: 'Quiet.', level: 'N5', firstLessonNumber: 12, firstDate: '2 Aug', lessonCount: 1 },
    { word: 'お願いします', reading: 'onegaishimasu', definition: 'Please, if you would.', level: 'N5', firstLessonNumber: 11, firstDate: '26 Jul', lessonCount: 3 },
    { word: '先週', reading: 'senshuu', definition: 'Last week.', level: 'N4', firstLessonNumber: 10, firstDate: '19 Jul', lessonCount: 2 },
  ],
  scoreTrend: [
    { lesson: 8, score: 6.4 }, { lesson: 9, score: 7.1 }, { lesson: 10, score: 6.9 },
    { lesson: 11, score: 7.8 }, { lesson: 12, score: 8.3 },
  ],
  // One of each state, so the preview shows both the waiting card and the
  // scored one rather than only half of what a student actually sees.
  tests: [
    {
      id: 't1', title: 'Particles — quick check', level: 'N4', lessonNumber: 12, date: '2 Aug',
      score: null, correct: null, total: null, takenOn: null,
    },
    {
      id: 't2', title: 'Restaurant phrases', level: 'N5', lessonNumber: 11, date: '26 Jul',
      score: 82, correct: 9, total: 11, takenOn: '27 Jul',
    },
  ],
  avgWpm: 54,
  avgThinkSec: 2.4,
  files: [
    { id: 'f1', fileName: 'Restaurant phrases — cheat sheet.pdf', lessonId: 's2', lessonNumber: 11, date: '26 Jul' },
    { id: 'f2', fileName: 'Weekend vocabulary.docx', lessonId: 's1', lessonNumber: 10, date: '19 Jul' },
  ],
}

/** A stand-in recap, so the recap preview is the real LessonPageTabs too. */
const SAMPLE_RECAP = {
  talk_percentage: 41,
  score: 8.3,
  level: 'Confident',
  vocab_level_distribution: { N5: 8, N4: 5, N3: 3 },
  vocab_total_count: 16,
  grammar_density: 'Medium-High',
  // Every field the metrics grid shows. The first version carried only four,
  // so the preview rendered a row of dashes — which read as broken, because in
  // a preview it is.
  metrics: {
    studentWpm: 96, teacherWpm: 118, avgResponseSec: 1.8, grammarPer100: 4.2,
    longestTurnSec: 26, avgTurnWords: 10, fillerCount: 4, longPauseCount: 2,
  },
  // `content`, not `body` — that is the key LessonPageTabs reads. The sample
  // used `body`, so the preview's Lesson tab showed headings over nothing and
  // the studio looked broken while the real page was fine.
  sections: [
    { title: 'What you worked on', content: 'Contrasting two ideas in one sentence, and softening a disagreement.' },
    { title: 'Where to focus next', content: 'けど joins two clauses — it does not start one. Practise starting the contrast in the middle.' },
  ],
  corrections: [
    { said: 'I go to go to Vancouver', correction: 'I have to go to Vancouver', categories: ['Verb form'], explanation: 'Replaced the repeated verb with "have to", which states necessity.' },
    { said: 'I am meeting up airport', correction: "I'm meeting up at the airport", categories: ['Preposition'], explanation: 'Added "at the" to mark the place, keeping the casual "meeting up".' },
  ],
  did_well: [
    { said: 'I have never been abroad before', note: 'Present perfect used correctly for life experience.' },
  ],
  // Array of { description }, matching a real recap. It was a bare string here,
  // and LessonPageTabs maps over it — so opening the lesson view of this studio
  // threw "homework.map is not a function" and took the whole page down.
  homework: [
    { description: 'Write five sentences contrasting something you like with something you do not.' },
    { description: 'Record a voice memo introducing your week using けど twice.' },
  ],
  teacher_note: 'Much more confident this week — you corrected yourself twice without help.',
  vocabulary: [
    { word: 'けど', reading: 'kedo', definition: 'but, although', jlpt_level: 'N5' },
    { word: '静か', reading: 'shizuka', definition: 'quiet', jlpt_level: 'N5' },
  ],
  // One of each exercise type, in the exact shapes LessonExercises renders —
  // the sample had none, so the studio's Practice tab previewed as empty.
  exercises: [
    {
      type: 'read_aloud', prompt: 'Read these aloud, focusing on けど.',
      data: {
        focus: 'Contrasting with けど',
        sentences: [
          { jp: '駅は近いけど、静かです。', en: 'The station is close, but it is quiet.' },
          { jp: '高いけど、おいしいです。', en: 'It is expensive, but delicious.' },
        ],
      },
    },
    {
      type: 'speak', prompt: 'Answer out loud.',
      data: { prompt_jp: '週末は何をしましたか。', prompt_en: 'What did you do at the weekend?', hint: 'Try one sentence with けど.' },
    },
    {
      type: 'multiple_choice', prompt: '',
      data: { question: 'Which sentence contrasts two ideas?', options: ['駅は近いです。', '近いけど、静かです。', '静かですか。'], answer: 1 },
    },
    {
      type: 'fill_blank', prompt: '',
      data: { before: '高い', after: '、おいしいです。', en: 'It is expensive, but delicious.', options: ['けど', 'から', 'ので'], answer: 'けど' },
    },
  ],
}

/**
 * The same believable student, learning French. Numbers and structure are
 * shared with the base sample — only the language-carrying content changes,
 * so a French teacher previews their brand on a French page instead of a
 * Japanese one. CEFR levels replace JLPT, nouns carry their articles, and
 * readings are empty, exactly as the real French recaps come out.
 */
const SAMPLE_FR: DashboardData = {
  ...SAMPLE,
  pillarLessons: [
    { id: 's3', number: 12, title: 'Contrasting ideas with mais', meta: '12th lesson · 2 Aug', score: 8.3, tag: 'Lesson 12', desc: 'Joining two ideas in one sentence, and softening a disagreement politely.' },
    { id: 's2', number: 11, title: 'Ordering at a restaurant', meta: '11th lesson · 26 Jul', score: 7.8, tag: 'Lesson 11', desc: 'Asking for a table, ordering, and checking the bill without switching to English.' },
    { id: 's1', number: 10, title: 'Talking about last weekend', meta: '10th lesson · 19 Jul', score: 6.9, tag: 'Lesson 10', desc: 'Past-tense practice: what you did, where you went, and how it was.' },
  ],
  vocabDistribution: { A1: 18, A2: 13, B1: 9, B2: 5 },
  vocabWords: [
    { word: 'mais', reading: '', definition: 'But.', level: 'A1', firstLessonNumber: 12, firstDate: '2 Aug', lessonCount: 1 },
    { word: 'tranquille', reading: '', definition: 'Quiet, calm.', level: 'A2', firstLessonNumber: 12, firstDate: '2 Aug', lessonCount: 1 },
    { word: "l'addition", reading: '', definition: 'The bill.', level: 'A1', firstLessonNumber: 11, firstDate: '26 Jul', lessonCount: 3 },
    { word: 'la semaine dernière', reading: '', definition: 'Last week.', level: 'A2', firstLessonNumber: 10, firstDate: '19 Jul', lessonCount: 2 },
  ],
  tests: [
    {
      id: 't1', title: 'Passé composé — quick check', level: 'A2', lessonNumber: 12, date: '2 Aug',
      score: null, correct: null, total: null, takenOn: null,
    },
    {
      id: 't2', title: 'Restaurant phrases', level: 'A1', lessonNumber: 11, date: '26 Jul',
      score: 82, correct: 9, total: 11, takenOn: '27 Jul',
    },
  ],
}

const SAMPLE_RECAP_FR = {
  ...SAMPLE_RECAP,
  vocab_level_distribution: { A1: 8, A2: 5, B1: 3 },
  sections: [
    { title: 'What you worked on', content: 'Contrasting two ideas in one sentence, and softening a disagreement.' },
    { title: 'Where to focus next', content: '"mais" joins two clauses — practise starting the contrast in the middle of the sentence, not with it.' },
  ],
  corrections: [
    { said: 'Je suis allé au le restaurant', correction: 'Je suis allé au restaurant', categories: ['Article'], explanation: '"au" already contains "le" — à + le contract into one word.' },
    { said: "J'ai mangé une pain", correction: "J'ai mangé un pain", categories: ['Gender'], explanation: '"pain" is masculine: un pain, le pain.' },
  ],
  did_well: [
    { said: "Je n'ai jamais visité Paris", note: 'Negation with "jamais" placed correctly around the auxiliary.' },
  ],
  homework: [
    { description: 'Write five sentences contrasting something you like with something you do not.' },
    { description: 'Record a voice memo introducing your week using "mais" twice.' },
  ],
  vocabulary: [
    { word: 'mais', reading: '', definition: 'but', jlpt_level: 'A1' },
    { word: 'tranquille', reading: '', definition: 'quiet, calm', jlpt_level: 'A2' },
  ],
  exercises: [
    {
      type: 'read_aloud', prompt: 'Read these aloud, focusing on mais.',
      data: {
        focus: 'Contrasting with mais',
        sentences: [
          { jp: "La gare est proche, mais c'est tranquille.", en: 'The station is close, but it is quiet.' },
          { jp: "C'est cher, mais c'est délicieux.", en: 'It is expensive, but delicious.' },
        ],
      },
    },
    {
      type: 'speak', prompt: 'Answer out loud.',
      data: { prompt_jp: "Qu'est-ce que tu as fait le week-end dernier ?", prompt_en: 'What did you do at the weekend?', hint: 'Try one sentence with "mais".' },
    },
    {
      type: 'multiple_choice', prompt: '',
      data: { question: 'Which sentence contrasts two ideas?', options: ['La gare est proche.', "Proche, mais tranquille.", "C'est tranquille ?"], answer: 1 },
    },
    {
      type: 'fill_blank', prompt: '',
      data: { before: "C'est cher, ", after: " c'est délicieux.", en: 'It is expensive, but delicious.', options: ['mais', 'parce que', 'donc'], answer: 'mais' },
    },
  ],
}

/** And learning English — phrasal verbs and CEFR levels. */
const SAMPLE_EN: DashboardData = {
  ...SAMPLE,
  pillarLessons: [
    { id: 's3', number: 12, title: 'Contrasting ideas with although', meta: '12th lesson · 2 Aug', score: 8.3, tag: 'Lesson 12', desc: 'Joining two ideas in one sentence, and softening a disagreement politely.' },
    { id: 's2', number: 11, title: 'Ordering at a restaurant', meta: '11th lesson · 26 Jul', score: 7.8, tag: 'Lesson 11', desc: 'Asking for a table, ordering, and checking the bill with confidence.' },
    { id: 's1', number: 10, title: 'Talking about last weekend', meta: '10th lesson · 19 Jul', score: 6.9, tag: 'Lesson 10', desc: 'Past-tense practice: what you did, where you went, and how it was.' },
  ],
  vocabDistribution: { A2: 18, B1: 13, B2: 9, C1: 5 },
  vocabWords: [
    { word: 'although', reading: '', definition: 'In spite of the fact that.', level: 'B1', firstLessonNumber: 12, firstDate: '2 Aug', lessonCount: 1 },
    { word: 'run out of', reading: '', definition: 'To use all of something.', level: 'B1', firstLessonNumber: 12, firstDate: '2 Aug', lessonCount: 1 },
    { word: 'the bill', reading: '', definition: 'What you pay at the end.', level: 'A2', firstLessonNumber: 11, firstDate: '26 Jul', lessonCount: 3 },
    { word: 'last week', reading: '', definition: 'The week before this one.', level: 'A2', firstLessonNumber: 10, firstDate: '19 Jul', lessonCount: 2 },
  ],
  tests: [
    {
      id: 't1', title: 'Past simple vs present perfect', level: 'B1', lessonNumber: 12, date: '2 Aug',
      score: null, correct: null, total: null, takenOn: null,
    },
    {
      id: 't2', title: 'Restaurant phrases', level: 'A2', lessonNumber: 11, date: '26 Jul',
      score: 82, correct: 9, total: 11, takenOn: '27 Jul',
    },
  ],
}

const SAMPLE_RECAP_EN = {
  ...SAMPLE_RECAP,
  vocab_level_distribution: { A2: 8, B1: 5, B2: 3 },
  sections: [
    { title: 'What you worked on', content: 'Contrasting two ideas in one sentence, and softening a disagreement.' },
    { title: 'Where to focus next', content: '"Although" starts the contrast — it never sits between two full sentences the way "but" does. Practise both.' },
  ],
  homework: [
    { description: 'Write five sentences contrasting something you like with something you do not.' },
    { description: 'Record a voice memo introducing your week using "although" twice.' },
  ],
  vocabulary: [
    { word: 'although', reading: '', definition: 'in spite of the fact that', jlpt_level: 'B1' },
    { word: 'run out of', reading: '', definition: 'to use all of something', jlpt_level: 'B1' },
  ],
  exercises: [
    {
      type: 'read_aloud', prompt: 'Read these aloud, focusing on although.',
      data: {
        focus: 'Contrasting with although',
        sentences: [
          { jp: 'Although the station is close, it is quiet.', en: 'Contrast: close, yet quiet.' },
          { jp: 'Although it is expensive, it is delicious.', en: 'Contrast: expensive, yet delicious.' },
        ],
      },
    },
    {
      type: 'speak', prompt: 'Answer out loud.',
      data: { prompt_jp: 'What did you do at the weekend?', prompt_en: 'Talk for 30 seconds.', hint: 'Try one sentence with "although".' },
    },
    {
      type: 'multiple_choice', prompt: '',
      data: { question: 'Which sentence contrasts two ideas?', options: ['The station is close.', 'Although it is close, it is quiet.', 'Is it quiet?'], answer: 1 },
    },
    {
      type: 'fill_blank', prompt: '',
      data: { before: '', after: ' it is expensive, it is delicious.', en: 'It is expensive, but delicious.', options: ['Although', 'Because', 'So'], answer: 'Although' },
    },
  ],
}

/**
 * The sample student in the teacher's own teaching language, so the studio
 * previews the page their students actually get. Japanese is the base sample;
 * unknown or unset languages read as English, the least surprising default.
 */
function sampleFor(teachingLanguage?: string | null): { data: DashboardData; recap: any; lessonTitle: string } {
  const l = (teachingLanguage ?? '').toLowerCase()
  if (/japanese|日本語/.test(l)) return { data: SAMPLE, recap: SAMPLE_RECAP, lessonTitle: 'Contrasting ideas with けど' }
  if (/french|français|francais/.test(l)) return { data: SAMPLE_FR, recap: SAMPLE_RECAP_FR, lessonTitle: 'Contrasting ideas with mais' }
  return { data: SAMPLE_EN, recap: SAMPLE_RECAP_EN, lessonTitle: 'Contrasting ideas with although' }
}

/**
 * One tool drawer in the studio menu: a header that opens its body. Defined at
 * module scope on purpose — a component declared inside BrandStudio would be a
 * new type on every render, and React would remount the open drawer (and drop
 * the caret out of whatever field was being typed in) on every keystroke.
 */
function Tool({ id, icon, tone = '', title, desc, openId, onOpen, children }: {
  id: string; icon: string; tone?: string; title: string; desc: string
  openId: string | null; onOpen: (id: string | null) => void; children: React.ReactNode
}) {
  const open = openId === id
  return (
    <section className={`k-sec k-tool ${open ? 'open' : ''}`}>
      <button type="button" className="k-tool-head" aria-expanded={open} onClick={() => onOpen(open ? null : id)}>
        <span className={`k-sec-icon ${tone}`} aria-hidden>{icon}</span>
        <span className="k-tool-title">
          <strong>{title}</strong>
          {open && <span className="desc">{desc}</span>}
        </span>
        <span className="k-tool-chev" aria-hidden>▾</span>
      </button>
      {open && <div className="k-tool-body">{children}</div>}
    </section>
  )
}

/**
 * One section, one switch. `options` is whatever that section can additionally
 * be told — a heading to rename, a ladder to edit — folded away until asked for,
 * so the common case stays a clean list of on/off.
 */
function SectionRow({ title, hint, on, onToggle, optionsOpen, onOptions, children }: {
  title: string; hint: string; on: boolean; onToggle: () => void
  optionsOpen?: boolean; onOptions?: () => void; children?: React.ReactNode
}) {
  return (
    <div className={`k-toggle-block ${optionsOpen ? 'open' : ''} ${on ? '' : 'off'}`}>
      <div className="k-toggle-row">
        <div style={{ minWidth: 0 }}>
          <div className="k-hw-title">{title}</div>
          <div className="k-hw-due">{hint}</div>
        </div>
        {onOptions && (
          <button type="button" className="k-opt-btn" aria-expanded={Boolean(optionsOpen)} onClick={onOptions}>
            Options <span aria-hidden>▾</span>
          </button>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title}
          className={`k-switch ${on ? 'on' : ''}`}
          onClick={onToggle}
        />
      </div>
      {optionsOpen && children && <div className="k-toggle-opts">{children}</div>}
    </div>
  )
}

/**
 * The branding studio.
 *
 * It used to be a layout editor: drag blocks around, pull their edges, type
 * onto the canvas. That bought a handful of arrangements nobody asked for and a
 * long tail of ways to end up with a broken page — and because the canvas drew
 * its own imitation of the portal, what a teacher designed was never quite what
 * their student opened.
 *
 * So: the arrangement is ours, the styling is theirs, and the preview renders
 * the real components (DashboardBlocks, LessonPageTabs) from the real brand.
 * If a block changes, the preview changes with it; there is nothing left to
 * keep in step by hand.
 *
 * Two tools, and they answer the only two questions a teacher has here:
 * Presets is what it looks like, Sections is what is on it. The pickers that
 * used to sit between them — an accent swatch, a font pairing, seven page
 * textures, four corner radii — were a teacher assembling a look one dropdown
 * at a time to arrive somewhere a preset already goes. A preset is that whole
 * decision, made once.
 */
export default function BrandStudio({ initial, teacherName, teachingLanguage }: { initial: Brand; teacherName: string; teachingLanguage?: string | null }) {
  const sample = sampleFor(teachingLanguage)
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [brand, setBrand] = useState<Brand>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard')
  const [dashTab, setDashTab] = useState<DashTab>('Overview')
  const [lessonTab, setLessonTab] = useState<LessonTab>('Progress')
  /** One tool open at a time — the menu is a stack of drawers, not a page. */
  const [tool, setTool] = useState<string | null>('presets')
  /** Which block's options are unfolded under its switch. */
  const [openOptions, setOpenOptions] = useState<string | null>(null)

  const canvasEl = useRef<HTMLDivElement | null>(null)
  const frameEl = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  // Fit the fixed-width canvas into whatever pane it has, and keep the space it
  // occupies in the layout equal to its scaled height.
  useEffect(() => {
    const wrap = canvasEl.current
    const frame = frameEl.current
    if (!wrap || !frame) return
    const fit = () => {
      const next = Math.min(1, wrap.clientWidth / CANVAS_WIDTH[device])
      setScale((s) => (Math.abs(s - next) > 0.001 ? next : s))
      const h = `${Math.round(frame.offsetHeight * next)}px`
      if (wrap.style.height !== h) wrap.style.height = h
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [device, view, dashTab, brand])

  const set = <K extends keyof Brand>(key: K, value: Brand[K]) => {
    setBrand((b) => ({ ...b, [key]: value }))
    setSaved(false)
  }

  const save = () =>
    startTransition(async () => {
      setError('')
      const res = await saveBrand(brand)
      if (!res.success) { setError(res.error || 'Could not save'); return }
      setSaved(true)
      router.refresh()
    })

  const reset = () => { setBrand(DEFAULT_BRAND); setSaved(false) }

  const showView = (v: 'dashboard' | 'lesson') => setView(v)

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    setBrand((b) => ({ ...b, ...p.brand }))
    setSaved(false)
  }

  // ── milestone ladder ────────────────────────────────────────────────────
  const patchLevel = (i: number, patch: Partial<{ name: string; lessons: number }>) =>
    set('levels', brand.levels.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const settleLevels = () => set('levels', resolveLevels(brand.levels))
  const addLevel = () => {
    const last = brand.levels[brand.levels.length - 1]
    set('levels', [...brand.levels, { name: 'New level', lessons: Math.min(MAX_LEVEL_LESSONS, (last?.lessons ?? 0) + 10) }])
  }
  const removeLevel = (i: number) => set('levels', brand.levels.filter((_, idx) => idx !== i))

  const vars = brandVars(brand)
  const L = brand.labels

  const activePreset = PRESETS.find(
    (p) => p.brand.accent.toLowerCase() === brand.accent.toLowerCase()
      && p.brand.font === brand.font && p.brand.shape === brand.shape && p.brand.background === brand.background,
  )

  const dashOn = DASH_REMOVABLE.filter(({ id }) => Boolean(brand[BLOCK_TOGGLE[id]])).length
  const lessonOn = LESSON_REMOVABLE.filter(({ id }) => Boolean(brand[LESSON_BLOCK_TOGGLE[id]])).length

  /** What has been ✕'d off the page being previewed — the tray offers it back. */
  const hiddenDash = DASH_REMOVABLE.filter(({ id }) => !brand[BLOCK_TOGGLE[id]])
  const hiddenLesson = LESSON_REMOVABLE.filter(({ id }) => !brand[LESSON_BLOCK_TOGGLE[id]])
  const hiddenMetrics = brand.hiddenMetrics ?? []
  const hiddenStats = brand.hiddenStats ?? []
  const hiddenSpeaking = brand.hiddenSpeaking ?? []

  /** Bring a section back, and land the preview on the tab it returns to. */
  const restoreDash = (id: BlockId) => { set(BLOCK_TOGGLE[id], true as never); setDashTab(DASH_BLOCK_TAB[id]) }
  const restoreLesson = (id: LessonBlockId) => { set(LESSON_BLOCK_TOGGLE[id], true as never); setLessonTab(LESSON_BLOCK_TAB[id]) }
  const removeMetric = (id: RecapMetricId) => set('hiddenMetrics', [...hiddenMetrics, id])
  const restoreMetric = (id: RecapMetricId) => { set('hiddenMetrics', hiddenMetrics.filter((x) => x !== id)); setLessonTab('Progress') }
  const removeStat = (id: DashStatId) => set('hiddenStats', [...hiddenStats, id])
  const restoreStat = (id: DashStatId) => { set('hiddenStats', hiddenStats.filter((x) => x !== id)); setDashTab('Overview') }
  const removeSpeak = (id: DashSpeakId) => set('hiddenSpeaking', [...hiddenSpeaking, id])
  const restoreSpeak = (id: DashSpeakId) => { set('hiddenSpeaking', hiddenSpeaking.filter((x) => x !== id)); setDashTab('Progress') }

  /**
   * The tabs and blocks this dashboard shows, exactly as the student's page
   * decides them — including dropping a tab whose sections are all switched
   * off. The preview used to keep every tab on the bar and put "everything
   * here is off" behind it, which is not what the student would find.
   */
  const placed = DASHBOARD_LAYOUT.filter(({ id }) => blockHasContent(id, brand, sample.data))
  const liveTabs = DASH_TABS.filter((t) => placed.some(({ id }) => DASH_BLOCK_TAB[id] === t))
  const activeDash = liveTabs.includes(dashTab) ? dashTab : liveTabs[0]
  const tabBlocks = placed.filter(({ id }) => DASH_BLOCK_TAB[id] === activeDash)

  return (
    <div className="k-studio">
      {/* ── controls ── */}
      <div className="k-studio-controls">
        <Tool id="presets" icon="✨" tone="" title="Presets" desc="A complete look — colour, type and texture in one go." openId={tool} onOpen={setTool}>
          <div className="k-presets">
            {PRESETS.map((p) => {
              const font = FONTS.find((f) => f.value === p.brand.font) ?? FONTS[0]
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`k-preset-card ${activePreset?.id === p.id ? 'sel' : ''}`}
                  onClick={() => applyPreset(p.id)}
                  title={p.hint}
                >
                  <span className={`k-preset-swatch k-bg-${p.brand.background}`} style={{ background: p.brand.accent, ['--bg-ink' as any]: 'rgba(255,255,255,.28)', ['--bg-tint' as any]: 'rgba(255,255,255,.2)' }}>
                    <b style={{ fontFamily: `${font.head}, system-ui, sans-serif` }}>Aa</b>
                    <i />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.hint}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </Tool>


        <Tool id="sections" icon="🧩" tone="p" title="Sections" desc="Switch off anything that doesn't fit how you teach. Empty a tab and the tab goes too." openId={tool} onOpen={setTool}>
          {/* The two pages are edited separately, and picking one drives the
              preview: you are always looking at the page you are stripping. */}
          <div className="k-seg" style={{ margin: '0 0 12px' }}>
            <button className={view === 'dashboard' ? 'on' : ''} onClick={() => showView('dashboard')}>Dashboard</button>
            <button className={view === 'lesson' ? 'on' : ''} onClick={() => showView('lesson')}>Lesson recap</button>
          </div>

          <p className="desc" style={{ margin: '0 0 10px' }}>
            {view === 'dashboard'
              ? `${dashOn} of ${DASH_REMOVABLE.length} sections on. Lessons, files and tests always show.`
              : `${lessonOn} of ${LESSON_REMOVABLE.length} measurement sections on. The lesson itself — notes, memo, practice, vocabulary, files — always shows.`}
          </p>

          {view === 'dashboard' ? (
            DASH_GROUPS.map(({ tab, ids }) => {
              const live = ids.filter((id) => Boolean(brand[BLOCK_TOGGLE[id]]))
              return (
                <div className="k-sgroup" key={tab}>
                  <button type="button" className={`k-sgroup-head ${activeDash === tab ? 'sel' : ''}`} onClick={() => setDashTab(tab)}>
                    <span>{L[`tab${tab}` as TextSlot]}</span>
                    <small className={live.length === 0 ? 'gone' : ''}>{live.length === 0 ? 'Tab hidden' : `${live.length}/${ids.length}`}</small>
                  </button>
                  <div className="k-toggles">
                    {ids.map((id) => {
                      const key = BLOCK_TOGGLE[id]
                      const slots = BLOCK_TEXT_SLOTS[id] ?? []
                      const hasOptions = slots.length > 0 || id === 'milestone'
                      const unfolded = openOptions === id
                      return (
                        <SectionRow
                          key={id}
                          title={BLOCK_LABELS[id]}
                          hint={BLOCK_HINTS[id]}
                          on={Boolean(brand[key])}
                          /* Switching a section ON opens its tab, so you see what
                             you just added. Switching one off leaves you where
                             you are — jumping to a tab that may have just
                             stopped existing only disorients. */
                          onToggle={() => { if (!brand[key]) setDashTab(tab); set(key, !brand[key] as never) }}
                          optionsOpen={hasOptions ? unfolded : undefined}
                          onOptions={hasOptions ? () => setOpenOptions(unfolded ? null : id) : undefined}
                        >
                          {slots.map((slot) => (
                            <label className="k-field" key={slot}>
                              <span>{TEXT_SLOTS[slot]}</span>
                              <input
                                value={L[slot]}
                                onChange={(e) => set('labels', { ...L, [slot]: e.target.value.slice(0, 40) })}
                                onBlur={(e) => { if (!e.target.value.trim()) set('labels', { ...L, [slot]: TEXT_SLOTS[slot] }) }}
                                placeholder={TEXT_SLOTS[slot]}
                              />
                            </label>
                          ))}

                          {/* Per-card switches, same as the recap's measured
                              tiles — keep the average, drop the talk share. */}
                          {id === 'stats' && (
                            <div className="k-toggles">
                              {DASH_STAT_TILES.map(({ id: sid, label }) => {
                                const on = !hiddenStats.includes(sid)
                                return (
                                  <div className="k-toggle-row" key={sid}>
                                    <div className="k-hw-title" style={{ fontWeight: 600 }}>{label}</div>
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={on}
                                      aria-label={label}
                                      className={`k-switch ${on ? 'on' : ''}`}
                                      onClick={() => { setDashTab('Overview'); on ? removeStat(sid) : restoreStat(sid) }}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {id === 'speaking' && (
                            <div className="k-toggles">
                              {DASH_SPEAK_TILES.map(({ id: sid, label }) => {
                                const on = !hiddenSpeaking.includes(sid)
                                return (
                                  <div className="k-toggle-row" key={sid}>
                                    <div className="k-hw-title" style={{ fontWeight: 600 }}>{label}</div>
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={on}
                                      aria-label={label}
                                      className={`k-switch ${on ? 'on' : ''}`}
                                      onClick={() => { setDashTab('Progress'); on ? removeSpeak(sid) : restoreSpeak(sid) }}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {id === 'milestone' && (
                            <>
                              <span className="k-field-label">Levels</span>
                              <p className="desc" style={{ marginBottom: 8 }}>What each level is called and how many lessons it takes. The bar fills as they get there.</p>
                              <div className="k-levels">
                                {brand.levels.map((lvl, i) => (
                                  <div className="k-level-row" key={i}>
                                    <input
                                      value={lvl.name}
                                      onChange={(e) => patchLevel(i, { name: e.target.value.slice(0, 24) })}
                                      placeholder="Level name"
                                      aria-label={`Level ${i + 1} name`}
                                    />
                                    <input
                                      type="number"
                                      min={1}
                                      max={MAX_LEVEL_LESSONS}
                                      value={lvl.lessons}
                                      onChange={(e) => patchLevel(i, { lessons: Number(e.target.value) })}
                                      onBlur={settleLevels}
                                      aria-label={`Lessons to reach ${lvl.name || `level ${i + 1}`}`}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-danger-ghost btn-sm"
                                      onClick={() => removeLevel(i)}
                                      disabled={brand.levels.length <= 1}
                                      aria-label={`Remove ${lvl.name || `level ${i + 1}`}`}
                                    >✕</button>
                                  </div>
                                ))}
                              </div>
                              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 9 }} onClick={addLevel} disabled={brand.levels.length >= MAX_LEVELS}>
                                + Add level
                              </button>
                            </>
                          )}
                        </SectionRow>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            LESSON_GROUPS.map(({ tab, ids }) => {
              const live = ids.filter((id) => Boolean(brand[LESSON_BLOCK_TOGGLE[id]]))
              return (
                <div className="k-sgroup" key={tab}>
                  <button type="button" className={`k-sgroup-head ${lessonTab === tab ? 'sel' : ''}`} onClick={() => setLessonTab(tab)}>
                    <span>{tab}</span>
                    <small className={live.length === 0 ? 'gone' : ''}>{live.length === 0 ? 'Tab hidden' : `${live.length}/${ids.length}`}</small>
                  </button>
                  <div className="k-toggles">
                    {ids.map((id) => {
                      const key = LESSON_BLOCK_TOGGLE[id]
                      // The measured-speaking card opens one level further: a
                      // switch per tile, so the drawer says what the canvas
                      // already allows — keep pace, drop hesitations.
                      const hasOptions = id === 'metrics'
                      const unfolded = openOptions === id
                      return (
                        <SectionRow
                          key={id}
                          title={LESSON_BLOCK_LABELS[id]}
                          hint={LESSON_BLOCK_HINTS[id]}
                          on={Boolean(brand[key])}
                          onToggle={() => { if (!brand[key]) setLessonTab(tab); set(key, !brand[key] as never) }}
                          optionsOpen={hasOptions ? unfolded : undefined}
                          onOptions={hasOptions ? () => setOpenOptions(unfolded ? null : id) : undefined}
                        >
                          {hasOptions && (
                            <div className="k-toggles">
                              {RECAP_METRICS.map(({ id: mid, label }) => {
                                const on = !hiddenMetrics.includes(mid)
                                return (
                                  <div className="k-toggle-row" key={mid}>
                                    <div className="k-hw-title" style={{ fontWeight: 600 }}>{label}</div>
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={on}
                                      aria-label={label}
                                      className={`k-switch ${on ? 'on' : ''}`}
                                      onClick={() => { setLessonTab('Progress'); on ? removeMetric(mid) : restoreMetric(mid) }}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </SectionRow>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </Tool>

        {error && <p className="k-error">{error}</p>}

        <div className="k-studio-actions">
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={pending}>Reset to default</button>
          {saved && <span className="k-saved">✓ Saved — your students see this now</span>}
          <button type="button" className="k-btn-block" style={{ width: 'auto', marginLeft: 'auto' }} onClick={save} disabled={pending}>
            {pending ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>

      {/* ── the real portal, at the real widths ── */}
      <div className="k-studio-preview">
        <div className="k-preview-bar">
          <span className="k-preview-label">
            {view === 'dashboard' ? 'Student dashboard' : 'Lesson recap'} · exactly what your students see
          </span>
          <div className="k-preview-switches">
            <div className="k-seg" style={{ margin: 0, width: 210 }}>
              <button className={view === 'dashboard' ? 'on' : ''} onClick={() => showView('dashboard')}>Dashboard</button>
              <button className={view === 'lesson' ? 'on' : ''} onClick={() => showView('lesson')}>Lesson recap</button>
            </div>
            <div className="k-seg" style={{ margin: 0, width: 168 }}>
              <button className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>Desktop</button>
              <button className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>Phone</button>
            </div>
          </div>
        </div>

        {/* Everything ✕'d off the page being previewed, one chip each. It sits
            over the canvas rather than in a menu because it answers the same
            gesture that hid it: what left the page comes back from the page. */}
        {(view === 'dashboard'
          ? hiddenDash.length + hiddenStats.length + hiddenSpeaking.length
          : hiddenLesson.length + hiddenMetrics.length) > 0 && (
          <div className="k-zap-tray">
            <span>Hidden:</span>
            {view === 'dashboard'
              ? (
                <>
                  {hiddenDash.map(({ id }) => (
                    <button key={id} type="button" onClick={() => restoreDash(id)}>+ {BLOCK_LABELS[id]}</button>
                  ))}
                  {hiddenStats.map((id) => (
                    <button key={id} type="button" onClick={() => restoreStat(id)}>
                      + {DASH_STAT_TILES.find((t) => t.id === id)?.label ?? id}
                    </button>
                  ))}
                  {hiddenSpeaking.map((id) => (
                    <button key={id} type="button" onClick={() => restoreSpeak(id)}>
                      + {DASH_SPEAK_TILES.find((t) => t.id === id)?.label ?? id}
                    </button>
                  ))}
                </>
              )
              : (
                <>
                  {hiddenLesson.map(({ id }) => (
                    <button key={id} type="button" onClick={() => restoreLesson(id)}>+ {LESSON_BLOCK_LABELS[id]}</button>
                  ))}
                  {hiddenMetrics.map((id) => (
                    <button key={id} type="button" onClick={() => restoreMetric(id)}>
                      + {RECAP_METRICS.find((mDef) => mDef.id === id)?.label ?? id}
                    </button>
                  ))}
                </>
              )}
          </div>
        )}

        <div className="k-canvas" ref={canvasEl}>
          <div
            ref={frameEl}
            className={`k-preview-frame ${device} ${backgroundClass(brand)}`}
            style={{ ...vars, ['--canvas-w' as any]: `${CANVAS_WIDTH[device]}px`, ['--canvas-scale' as any]: scale }}
          >
            {view === 'dashboard' ? (
              <>
                <div className="k-top">
                  <div>
                    <p className="k-hello">{L.greeting}</p>
                    <h1 className="k-name">Derek</h1>
                  </div>
                  <div className="k-top-tools">
                    <div className="k-whoami">
                      <span className="k-whoami-mark" aria-hidden>{brand.logoText}</span>
                      <span className="k-whoami-name">{brand.portalName}</span>
                    </div>
                  </div>
                </div>

                {liveTabs.length > 0 && (
                  <div className="k-dtabs">
                    {liveTabs.map((t) => (
                      <button key={t} type="button" className={activeDash === t ? 'on' : ''} onClick={() => setDashTab(t)}>
                        {L[`tab${t}` as 'tabOverview' | 'tabLessons' | 'tabProgress' | 'tabFiles' | 'tabTests']}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`k-flow ${device === 'mobile' ? 'narrow' : ''}`} key={`${activeDash}-${device}`}>
                  {tabBlocks.map(({ id, w }) => {
                    // Locked blocks carry no ✕: the lesson list, the files and
                    // the tests are the dashboard, not options on it.
                    const removable = !DASH_LOCKED.has(id)
                    return (
                      <div key={id} style={{ ['--w' as any]: w }} className={removable ? 'k-zap' : undefined}>
                        {removable && (
                          <>
                            <span className="k-zap-tag" aria-hidden>{BLOCK_LABELS[id]}</span>
                            <button
                              type="button"
                              className="k-zap-x"
                              aria-label={`Remove ${BLOCK_LABELS[id]}`}
                              title={`Remove ${BLOCK_LABELS[id]}`}
                              onClick={() => set(BLOCK_TOGGLE[id], false as never)}
                            >✕</button>
                          </>
                        )}
                        <DashboardBlock id={id} brand={brand} data={sample.data} preview onRemoveStat={removeStat} onRemoveSpeak={removeSpeak} />
                      </div>
                    )
                  })}
                  {tabBlocks.length === 0 && <div className="k-flow-empty">Every section is switched off — your students would see an empty dashboard</div>}
                </div>
              </>
            ) : (
              <div className="k-lpview">
                <span className="k-back">← Dashboard</span>

                {/* The recap's own header, same markup as the student's page —
                    without it the preview opened straight onto a tab bar, which
                    is not what a recap looks like, and the page decoration had
                    nowhere to show. */}
                <header className="k-phead">
                  <div>
                    <div className="k-phead-eyebrow">Lesson 12 · Recap</div>
                    <h1>{sample.lessonTitle}</h1>
                    <div className="k-pmeta"><span>2 Aug</span></div>
                  </div>
                  <div className="k-pscore">
                    <div><b>8.3</b><small>OUT OF 10</small></div>
                  </div>
                  <div className="k-hero-art" style={{ right: 150, opacity: .4 }} aria-hidden>
                    <span className="k-orb" style={{ width: 70, height: 70, right: 0, top: 10 }} />
                    <span className="k-tube" style={{ width: 56, height: 56, right: 60, top: 74, transform: 'rotate(40deg)' }} />
                  </div>
                </header>

                <LessonPageTabs
                  lesson={{ id: 'preview', lessonNumber: 12, date: '2 Aug', title: sample.lessonTitle, recap: sample.recap }}
                  language={teachingLanguage}
                  studentFirst="Derek"
                  teacherFirst={teacherName || 'Your teacher'}
                  brand={brand}
                  preview
                  tab={lessonTab}
                  onTabChange={setLessonTab}
                  onRemoveSection={(id) => set(LESSON_BLOCK_TOGGLE[id], false as never)}
                  onRemoveMetric={removeMetric}
                />
              </div>
            )}
          </div>
        </div>

        <p className="k-fine" style={{ textAlign: 'left' }}>
          This is the student portal itself, rendered with your styling — not a mock-up of it.
          {' '}<strong>Hover any section and press ✕ to take it off the page</strong> — the rest closes up around it,
          and a chip above the page brings it back. The arrangement is fixed so it stays readable on a phone.
          {' '}Save to publish it to {teacherName ? `${teacherName}'s` : 'your'} students.
        </p>
      </div>
    </div>
  )
}
