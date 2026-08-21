/**
 * OpenAI recap generation — schema + prompt mirror the live n8n workflow
 * "GENOA_Drive_Monitor" so recaps match the teacher-portal / GENOA Library format.
 * Input here is a diarized meeting transcript (extension recording → Whisper)
 * instead of a Drive doc.
 */
import { pgSafeJson } from '@/lib/pg-json'

const OPENAI_MODEL = 'gpt-4.1'

export type VocabItem = {
  word: string
  reading: string
  definition: string
  explanation: string
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | string
  example_sentence: string
}
export type Exercise = { type: string; prompt: string; data: any }
export type Section = { title: string; content: string }

/**
 * One thing the student got wrong, quoted back to them.
 *
 * `said` is verbatim from the transcript — that is the whole point. A recap
 * that paraphrases the mistake is a recap the student cannot recognise as
 * their own, and the transcript is word-accurate, so there is no reason to.
 */
export type Correction = {
  said: string
  correction: string
  /** 1-2 labels naming the kind of error, from CORRECTION_CATEGORIES. */
  categories: string[]
  explanation: string
}

/** The counterweight: something they genuinely got right, quoted the same way. */
export type Strength = { said: string; note: string }

/** A closed list, so the labels stay comparable across lessons and languages. */
export const CORRECTION_CATEGORIES = [
  'Verb form', 'Verb tense', 'Word order', 'Preposition', 'Article', 'Agreement',
  'Pronoun', 'Plural', 'Negation', 'Question form', 'Word choice', 'Register',
  'Particle', 'Conjugation', 'Spelling', 'Pronunciation',
] as const

export type Recap = {
  lesson_title: string
  recap: string
  score: number
  talk_percentage: number
  grammar_density: string
  confidence_label: string
  teacher_note: string
  audio_script: string
  vocab_total_count: number
  vocab_level_distribution: Record<string, number>
  vocabulary: VocabItem[]
  /** The full inventory — every word worth counting, not just the shown ten. */
  vocabulary_all: { word: string; level: string }[]
  homework: { description: string }[]
  exercises: Exercise[]
  sections: Section[]
  corrections: Correction[]
  did_well: Strength[]
}

/**
 * The corrections half of both prompts.
 *
 * This used to be a free-text section ("Main Corrections & Refinements") of
 * bullet points, which read as advice about the language rather than about the
 * student. Quoting them verbatim and naming the error type is the same
 * information, but it is *theirs* — and it only works because the transcript
 * is word-accurate with the speakers already separated.
 */
/**
 * Vocabulary comes out in two shapes on purpose.
 *
 * `vocabulary` is the ten the recap page shows, with everything a student
 * needs to study a word. `vocabulary_all` is the inventory — every word worth
 * counting, carrying only what it takes to count and level it. Before this,
 * the totals were an integer the model estimated, which could not be checked
 * against anything; now the number is a count of rows the student can scroll.
 */
const VOCAB_INVENTORY_RULES = `VOCABULARY INVENTORY — for the "vocabulary_all" array:
EVERY vocabulary item worth tracking that appeared in this lesson — not just the ten above. Typically 25-60 for a full lesson.
- Include content words (nouns, verbs, adjectives, adverbs), set phrases, idioms and grammar patterns that carry meaning.
- EXCLUDE function words with no learning value on their own: articles, bare pronouns, basic conjunctions, and filler sounds.
- Deduplicate: one entry per distinct word. List a word in its DICTIONARY form (infinitive, plain form, singular), not as it happened to be conjugated — "allait" is the word "aller", met once.
- Every item in "vocabulary" above must also appear here.
- Shape: {"word": "[the word]", "level": "[level]"} and nothing else — keep it compact.
If the transcript is too noisy to be sure a word was really said, leave it out. An honest short list beats a padded one.`

const CORRECTIONS_RULES = `CORRECTIONS — for the "corrections" array:
The mistakes the STUDENT actually made that are worth fixing. 4-8 items, most useful first.
- "said": the student's own words, quoted VERBATIM from the transcript — a short fragment (max ~12 words) containing the mistake. Copy it exactly as it appears. NEVER paraphrase it, NEVER clean it up, NEVER invent it, and NEVER quote the teacher.
- "correction": that same fragment written correctly, changing as little as possible. Keep their wording and register everywhere it was already fine.
- "categories": 1-2 labels naming the kind of error, taken from EXACTLY this list: Verb form, Verb tense, Word order, Preposition, Article, Agreement, Pronoun, Plural, Negation, Question form, Word choice, Register, Particle, Conjugation, Spelling, Pronunciation.
- "explanation": ONE sentence, max 25 words, saying what changed and why.
If the student made no real mistakes, return an empty array. Never invent a mistake to fill the list, and never correct something they said correctly.

DID WELL — for the "did_well" array:
1-3 things the student genuinely got RIGHT, quoted the same way. This is not flattery — only include something if the transcript shows them handling it well.
- "said": verbatim quote of the student doing it.
- "note": ONE sentence, max 25 words, naming what was good about it.`

/**
 * How Japanese is written in the RECAP — the same three modes as the test,
 * because it is the same student reading both.
 *
 * The recap used to hardcode "kana, never kanji" in three separate places and
 * ask for romaji on vocab bullets only, which is why a beginner's example
 * sentences and Pattern lines came out as bare kanji they could not read. The
 * rule now lives in one block, is stated for every field, and follows what the
 * teacher recorded about this particular student.
 */
const RECAP_SCRIPT_RULES: Record<TestScript, string> = {
  beginner: `JAPANESE SCRIPT — OVERRIDES EVERY EXAMPLE BELOW. This student CANNOT read kana confidently.
- Write ALL Japanese in hiragana/katakana ONLY — NEVER kanji. This covers section bodies, example sentences, **Pattern:** lines, corrections, homework, exercises and the audio script.
- IMMEDIATELY after EVERY piece of Japanese, add its romaji. No exceptions anywhere in the output.
- Vocab bullets: - **かな** *romaji* — English meaning
- Example sentences: each on its own line as かなのぶん *romaji* — English
- Pattern lines: spell the structure in kana and put its romaji right after, e.g. **Pattern:** [verb plain]まえに *mae ni* [action]します
- EXERCISES TOO, and this is the one that gets forgotten: every multiple_choice option, every fill_blank option, the fill_blank "answer", and the "before"/"after" text are each written as かな (romaji) — e.g. "いきます (ikimasu)". A bare word in a dropdown is exactly as unreadable as a bare sentence. The "answer" must match its option character for character, romaji included.
- A line of Japanese with no romaji beside it is useless to this student. There must not be a single one.`,
  hiragana: `JAPANESE SCRIPT — this student reads kana fluently but not kanji.
- Write ALL Japanese in hiragana/katakana ONLY — NEVER kanji, everywhere in the output.
- Romaji only on vocab bullets (- **かな** *romaji* — English meaning). Example sentences and Pattern lines carry no romaji.`,
  kanji: `JAPANESE SCRIPT — this student reads kanji.
- Write Japanese naturally WITH kanji throughout.
- The FIRST time a kanji word appears in a section, put its kana reading in parentheses right after it, e.g. 準備（じゅんび）.
- Romaji only on vocab bullets; nowhere else.`,
}

/**
 * The one thing no script rule may touch.
 *
 * A correction's "said" is a verbatim transcript quote, and the transcript is
 * whatever Whisper wrote — usually kanji. Rewriting it to satisfy a script
 * rule would make it no longer the student's own words, which is the entire
 * value of quoting it. Only the fix is rewritten.
 */
const VERBATIM_EXEMPTION = `SCRIPT EXEMPTION: a correction's "said" and a did_well "said" are VERBATIM transcript quotes — copy them exactly as the transcript has them, kanji included, whatever the script rules say. The "correction" text DOES follow the script rules.`

const PROMPT = `Analyze this Japanese lesson transcript and return ONLY valid JSON.

{{RECAP_SCRIPT_RULES}}

The transcript is auto-generated and diarized (lines look like "Speaker Name: text"). It is NOISY: parts are garbled phonetic gibberish (e.g. "キャンキャンナーグラム", "エペネンフォーエグザン") — IGNORE the gibberish and work from the clean, legible Japanese, which is reliable. The meeting host is the teacher; other speakers are the student.

CRITICAL — BE EXHAUSTIVE. Read the ENTIRE transcript start to finish and extract EVERY grammar point, verb form, and pattern that was taught or drilled, even briefly. Give the LATER HALF of the transcript equal attention — points near the end (often buried in noisy text) are commonly and wrongly dropped. Scan the final third specifically for things like 〜ながら, 〜おかげで/〜せいで, 〜ばよかった, and set phrases. Do NOT stop early or summarize only the first few. A single textbook lesson often has 10-16 grammar points. Actively scan for these commonly-missed items and include each one you find:
- Transitive/intransitive verb PAIRS (自動詞/他動詞): e.g. 開ける/開く, 出す/出る, つける/つく, 消す/消える, 汚す/汚れる, 落とす/落ちる, 入れる/入る — if ANY pair appears, make a dedicated section on the transitive/intransitive contrast.
- Hearsay / reported speech: そうだ, みたい, 〜って, らしい
- Potential form: 来られる/来られない, 食べられる, etc.
- Conditionals: 〜と, 〜ば, 〜たら, 〜となると/〜になると ("when it becomes")
- Regret / hindsight: 〜ばよかった
- Preparation: 〜ておく/〜とく
- Accidental/completed: 〜ちゃう/〜ちゃった, 〜てしまう/〜てしまった
- Simultaneous: 〜ながら
- Reason: 〜おかげで (positive), 〜せいで (negative), 〜んです, 〜から
- Presumption: だろう/でしょう
- Nominalization: 〜のは, 〜こと
- State: 〜ている, 〜てある
- Set phrases: お先に失礼します, お疲れ様, etc.
Every grammar point that has clean Japanese evidence in the transcript MUST get its own section. Missing a point that was clearly taught is a failure.

DO NOT OVER-SPLIT one grammar family: put ALL transitive/intransitive verb pairs (開ける/開く, 出す/出る, つける/つく, 消す/消える, 落とす/落ちる, etc.) together in ONE single section — list them as multiple examples inside it, never one section per pair. That frees room to cover the OTHER distinct points.

Before writing, mentally list every distinct grammar point with transcript evidence, then output ONE section for EACH. Treat these as separate, mandatory sections whenever their pattern appears in the transcript (they are independent of each other): hearsay (そうだ/みたい/って), potential form (来られる), 〜となると/〜になると, 〜ておく/〜とく, 〜ちゃう/〜ちゃった/〜てしまった, 〜ながら, 〜おかげで/〜せいで, 〜ばよかった, 〜んです, だろう/でしょう, 〜のは, and set phrases (お先に失礼します). If the transcript shows it, it gets its own section — do not drop it to save space.

EQUALLY CRITICAL — CAPTURE WHAT THE LESSON WAS ABOUT, NOT ONLY ITS GRAMMAR. Grammar sections alone are NOT a faithful recap of a conversation lesson. Identify what actually happened, in order:
- Any material read or worked through together — an article, text, dialogue, or exercise sheet. Say what it was about and pull out its key facts and figures. Reading a text together is one of the most common lesson activities and one of the most commonly, wrongly omitted.
- Any topics DISCUSSED — opinions, personal experiences, culture comparisons, current events. Name the topic and what the student said about it.
- Any other activities: listening practice, role-play, pronunciation work, homework review, test preparation.
These become the FIRST sections of the recap (see SECTION FORMAT). A recap that never mentions the article that was read or the discussion that filled half the lesson is WRONG, even if every grammar point is listed.

Student: {{STUDENT}}

Return this exact structure. Replace ALL bracketed placeholders with calculated values — never copy placeholder text:
{
  "lesson_title": "[short clean lesson title — follow LESSON TITLE rules below]",
  "recap": "[Full formatted lesson recap — follow RECAP FORMAT below]",
  "score": [calculated 0.0-10.0],
  "talk_percentage": [estimated integer 0-100],
  "grammar_density": "[Low or Medium or Medium-High or High]",
  "confidence_label": "[result of weighted formula below]",
  "teacher_note": "[warm 2-3 sentence personal note to this student]",
  "audio_script": "[voice memo script — follow AUDIO SCRIPT rules below]",
  "vocab_total_count": [integer — total distinct vocabulary items in this lesson],
  "vocab_level_distribution": {"N5": [count], "N4": [count], "N3": [count], "N2": [count], "N1": [count]},
  "vocabulary": [{"word": "[Japanese]", "reading": "[romaji]", "definition": "[English.]", "explanation": "[1-2 warm sentences]", "jlpt_level": "[N5/N4/N3/N2/N1]", "example_sentence": "[Japanese sentence]"}],
  "vocabulary_all": [{"word": "[Japanese]", "level": "[N5/N4/N3/N2/N1]"}],
  "homework": [],
  "exercises": [{"type": "[speak|multiple_choice|fill_blank]", "prompt": "[short instruction]", "data": {}}],
  "sections": [{"title": "[see SECTION FORMAT — content/activity sections FIRST, then grammar]", "content": "[see SECTION FORMAT]"}],
  "corrections": [{"said": "[verbatim student quote]", "correction": "[fixed]", "categories": ["[label]"], "explanation": "[one sentence]"}],
  "did_well": [{"said": "[verbatim student quote]", "note": "[one sentence]"}]
}

HOMEWORK: ALWAYS the empty array []. Homework is the teacher's own to assign — never invent it, even if homework was mentioned in the lesson.

SCORING:
- score: Student accuracy, grammar, fluency, engagement. 0.0-10.0 one decimal.
- talk_percentage: Count turns. Estimate student share of speaking time. Integer 0-100.
- grammar_density: Amount of new/complex grammar. Low / Medium / Medium-High / High.

CONFIDENCE — weighted formula:
Self-correction (30%) + Response independence (25%) + Grammar recognition (20%) + Japanese output (15%) + Difficulty handled (10%)
0.0-3.9 = Developing | 4.0-5.9 = Building | 6.0-7.9 = Strong Foundation | 8.0-10.0 = Confident

{{VOCAB_INVENTORY_RULES}}

VOCABULARY DETECTION — for vocab_total_count and vocab_level_distribution:
- These must AGREE with "vocabulary_all": vocab_total_count is its length, and vocab_level_distribution is its items counted per JLPT level. Do not estimate them separately.
- Include all 5 levels even if a count is 0.

LESSON TITLE — for the "lesson_title" field:
A short, clean, student-facing title (3-7 words, English, Title Case) naming what the lesson covered — like a textbook chapter heading. Examples: "Contrasting Ideas & Giving Reasons", "Making Comparisons and Strong Advice", "Greetings and Self Introduction". NO student/teacher names, NO dates, NO lesson numbers, NO quotes.

RECAP FORMAT — for the "recap" field:
Write a SHORT overview only — 2 to 3 sentences, max ~55 words. Name what the lesson actually consisted of — the material read (and its subject), the topics discussed — and what the student practiced, in a warm, plain, student-friendly voice. This is a quick summary shown above the detailed sections, so DO NOT include a title line, example sentences, romaji blocks, vocab lists, bullet points, or a "Main takeaway" — all of that lives in the sections and other fields. Just a compact paragraph.

SECTION FORMAT — two kinds of sections, numbered continuously, CONTENT sections FIRST.

MANDATORY LAYOUT for the "content" string of EVERY section, both kinds. Each element goes on its OWN line — put real newlines inside the JSON string; NEVER run bullets, examples, or callouts together into one paragraph:
- Start with 1-3 short plain English sentences.
- Vocab bullets, ONE PER LINE, in the shape the SCRIPT rules give.
- Example sentences as a block, one sentence per line, each written exactly as the SCRIPT rules require — a beginner's example without romaji beside it is a failure.
- Grammar callouts on their own line: **Pattern:** structure, also following the SCRIPT rules
- Tips on their own line: Natural note: text OR Important: text
- NO sub-headers. SHORT sentences only.
A section whose bullets and Pattern line are glued into one paragraph is WRONG — the app renders each line separately and the formatting is lost.

(A) CONTENT sections — one per activity or discussion topic (typically 1-4), in lesson order. Title: "Activity: Subject", e.g. "1. Reading: Article About Work Styles" or "2. Discussion: Weekend Plans". Body: 2-4 short sentences saying what the material or discussion was actually ABOUT — including its key facts and figures — and what the student did with it, then the notable expressions it introduced as vocab bullets (one per line), and 1-2 example sentences from the material as a block.
(B) GRAMMAR sections — one per DISTINCT grammar point. Include ALL of them (typically 10-16 for a full lesson) — do not cap at a small number, do not merge distinct points. Order them as they appeared in the lesson. Title: "3. Japanese: English" (e.g. "3. いきます: To Go Somewhere"). Body: explanation sentences, vocab bullets, an example block, and a **Pattern:** line, per the layout above.

{{CORRECTIONS_RULES}}
{{VERBATIM_EXEMPTION}}

AUDIO SCRIPT — for the "audio_script" field:
Write based on the recap. One paragraph per topic, no transitions between paragraphs.
Structure: Opening line "Hi [first name], great work on today's lesson." Then one paragraph per topic (Japanese word — meaning — short example, written per the SCRIPT rules). Personal closing line.
Total: 45-75 seconds when read aloud.

EXERCISES — generate exactly 10 practice exercises based ONLY on this lesson's grammar and vocabulary, in this order: 3 speak, 4 multiple_choice, 3 fill_blank. Every exercise drills something that actually came up in this lesson; do not pad with generic material.
Every Japanese string below follows the SCRIPT rules. Keep everything at this student's level.
The "data" object depends on "type":
- speak → prompt: "Answer out loud". A QUESTION ABOUT THIS LESSON'S CONTENT — the material read, the discussion had, the situations practiced — that the student answers in their own words using today's grammar and vocabulary. Never "read this sentence": it must require the student to produce an answer. data: {"prompt_jp": "[the question, per SCRIPT rules]", "prompt_en": "[English]", "hint": "[a genuine help: the pattern to reach for and 1-2 of today's words to use, e.g. \"Use それから to connect two actions — try いきます and たべます\"]"}
- multiple_choice → prompt: "Quick check". data: {"question": "[question in English about this lesson]", "options": ["[opt1]", "[opt2]", "[opt3]"], "answer": [integer index 0-2 of the correct option]}
- fill_blank → prompt: "Fill in the blank". data: {"before": "[text before the gap, per SCRIPT rules]", "after": "[text after the gap, per SCRIPT rules]", "options": ["[opt1]", "[opt2]", "[opt3]"], "answer": "[the correct option, must exactly match one option]", "en": "[English translation]"}

VOCABULARY RULES:
- Include exactly 10 vocabulary words.
- "reading": romaji ONLY. Never empty.
- "definition": short English meaning ending with a period.
- "explanation": 1-2 short warm sentences.

JLPT LEVEL — STRICT RULES:
Anchor: N5: です、行く、食べる | N4: 帰る、困る、準備する | N3: 断る、比べる、関係 | N2: 把握する、手配する | N1: rare literary only.
1. Everyday conversational words belong at N3 or below.
2. Cultural nuance or formality does NOT raise the JLPT level.
3. When unsure between N3 and N2, always choose N3.
4. Only assign N2 or N1 if absent from a standard N3-level textbook.

Transcript:
{{TRANSCRIPT}}`

// ── Test generation ─────────────────────────────────────────────────────────

export type TestMCQuestion = { type: 'multiple_choice'; question: string; options: string[]; answer: number; explanation?: string }
export type TestGapQuestion = { type: 'fill_blank'; before: string; after: string; options: string[]; answer: string; en?: string }
export type TestReadingPassage = { passage: string; passage_en?: string; questions: TestMCQuestion[] }
export type TestSpeakingPrompt = { prompt_jp: string; prompt_en: string; hint: string }
export type TestPart =
  | { key: 'vocabulary'; title: string; instructions: string; questions: TestMCQuestion[] }
  | { key: 'grammar'; title: string; instructions: string; questions: (TestMCQuestion | TestGapQuestion)[] }
  | { key: 'reading'; title: string; instructions: string; passages: TestReadingPassage[] }
  | { key: 'speaking'; title: string; instructions: string; prompts: TestSpeakingPrompt[] }
export type TestJson = {
  title: string
  level: string
  intro: string
  parts: TestPart[]
  script?: TestScript
}

// How Japanese is written in the test — some students can't read kana yet,
// others are past it and need kanji practice.
export type TestScript = 'beginner' | 'hiragana' | 'kanji'

export const TEST_SCRIPTS: Record<TestScript, { label: string; sub: string }> = {
  beginner: { label: 'Beginner', sub: 'Hiragana + romaji' },
  hiragana: { label: 'Hiragana', sub: 'Kana, no romaji' },
  kanji: { label: 'Kanji + kana', sub: 'Kanji with readings' },
}

const SCRIPT_RULES: Record<TestScript, string> = {
  beginner: `- Write ALL Japanese in hiragana/katakana ONLY — NEVER kanji.
- IMMEDIATELY after EVERY piece of Japanese, add its romaji in parentheses. This applies everywhere: questions, every multiple-choice option that contains Japanese, fill_blank "before"/"after"/options/answer text, reading passages (romaji after each sentence), and speaking prompts. Example: 「たべます (tabemasu)」. The student cannot read kana confidently yet — Japanese without romaji is useless to them.
- fill_blank options and "answer" must each be "かな (romaji)" so the answer still matches an option exactly.`,
  hiragana: `- Write ALL Japanese in hiragana/katakana ONLY — NEVER kanji, and do NOT add romaji anywhere. The student reads kana fluently.`,
  kanji: `- Write Japanese naturally WITH kanji, as in a real JLPT paper.
- The FIRST time each kanji word appears in a question, option, or prompt, add its hiragana reading in parentheses right after it, e.g. 漢字（かんじ）. In reading passages, add the reading after each kanji word on first appearance in that passage.
- No romaji anywhere.`,
}



const TEST_PROMPT = `You are creating a JLPT-N5-style practice test for a Japanese student, based on the specific lesson(s) they took. Return ONLY valid JSON.

Student: {{STUDENT}}
Lesson title: {{LESSON_TITLE}}
Lesson content (recap of what was taught — base EVERY question on this material):
{{LESSON_CONTENT}}

Build a LONG, thorough test in classic JLPT exam style, testing ONLY grammar, vocabulary, and patterns that appear in the lesson content above (plus basic N5 fundamentals needed to form the sentences). Difficulty: N5 exam style unless the lesson content is clearly higher level — then match the lesson.

Return this exact structure:
{
  "title": "[short test title based on the lesson, e.g. 'Practice Test — Contrasting Ideas & Giving Reasons']",
  "level": "N5",
  "intro": "[2 warm sentences telling the student what the test covers and encouraging them]",
  "parts": [
    {
      "key": "vocabulary",
      "title": "Part 1 · Vocabulary (ごい)",
      "instructions": "Choose the best meaning or word.",
      "questions": [ {"type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."} ]
    },
    {
      "key": "grammar",
      "title": "Part 2 · Grammar (ぶんぽう)",
      "instructions": "Choose the correct form, or fill the gap.",
      "questions": [
        {"type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."},
        {"type": "fill_blank", "before": "[Japanese before gap]", "after": "[Japanese after gap]", "options": ["...","...","..."], "answer": "[must exactly match one option]", "en": "[English translation of full sentence]"}
      ]
    },
    {
      "key": "reading",
      "title": "Part 3 · Reading (どっかい)",
      "instructions": "Read each passage, then answer the questions.",
      "passages": [
        {"passage": "[4-6 sentence passage using the lesson's grammar]", "passage_en": "[English translation]", "questions": [ {"type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."} ]}
      ]
    },
    {
      "key": "speaking",
      "title": "Part 4 · Speaking (かいわ)",
      "instructions": "Answer each prompt out loud in Japanese. Record or practice with your teacher.",
      "prompts": [ {"prompt_jp": "[question in Japanese]", "prompt_en": "[English]", "hint": "[which grammar/vocab from the lesson to use]"} ]
    }
  ]
}

REQUIRED LENGTH — this is a full practice exam, not a quiz. It covers {{LESSON_COUNT}} lesson(s), and the length scales with that:
- Part 1 vocabulary: exactly {{N_VOCAB}} multiple_choice questions.
- Part 2 grammar: exactly {{N_GRAMMAR_MC}} multiple_choice + {{N_GRAMMAR_FB}} fill_blank questions, covering EVERY distinct grammar point in the lesson content.
- Part 3 reading: exactly {{N_PASSAGES}} passages, each with 3-4 multiple_choice questions.
- Part 4 speaking: exactly {{N_SPEAKING}} prompts.
- Spread coverage across ALL the lessons provided — do not let one lesson dominate.

JAPANESE SCRIPT — the teacher chose how this student reads Japanese. Follow these rules for EVERY piece of Japanese in the test:
{{SCRIPT_RULES}}

{{DIRECTIONS}}STRICT RULES:
- multiple_choice: exactly 4 options, exactly one correct, "answer" is the 0-based index of the correct option. Vary the correct index — do not cluster on 0.
- Wrong options must be plausible (common learner mistakes), not silly.
- fill_blank: exactly 3 options; "answer" must match one option character-for-character.
- "explanation": ONE short English sentence saying why the answer is right (shown to the teacher, and to the student after they answer).
- Question style like the real JLPT: meaning selection, correct-particle choice, correct-conjugation choice, sentence completion, ordering by meaning.
- Base questions on the lesson content — vocabulary from its vocab list, grammar from its sections. Do not invent unrelated advanced material.`

/**
 * The same exam for English and French lessons. Identical JSON shape, so every
 * page renders unchanged; JLPT becomes CEFR and the script rules (a Japanese
 * writing-system concern) disappear.
 */
const TEST_PROMPT_GENERIC = `You are creating a CEFR-style practice test for a student learning {{LANGUAGE}}, based on the specific lesson(s) they took. Return ONLY valid JSON.

Student: {{STUDENT}}
Lesson title: {{LESSON_TITLE}}
Lesson content (recap of what was taught — base EVERY question on this material):
{{LESSON_CONTENT}}

Build a LONG, thorough test in classic language-exam style, testing ONLY grammar, vocabulary, and patterns that appear in the lesson content above (plus the fundamentals needed to form the sentences). Difficulty: match the lesson content's CEFR level (default A2 if unclear).

Return this exact structure:
{
  "title": "[short test title based on the lesson]",
  "level": "[CEFR level, e.g. A2]",
  "intro": "[2 warm sentences in English telling the student what the test covers and encouraging them]",
  "parts": [
    {
      "key": "vocabulary",
      "title": "Part 1 · Vocabulary",
      "instructions": "Choose the best meaning or word.",
      "questions": [ {"type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."} ]
    },
    {
      "key": "grammar",
      "title": "Part 2 · Grammar",
      "instructions": "Choose the correct form, or fill the gap.",
      "questions": [
        {"type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."},
        {"type": "fill_blank", "before": "[{{LANGUAGE}} before gap]", "after": "[{{LANGUAGE}} after gap]", "options": ["...","...","..."], "answer": "[must exactly match one option]", "en": "[English translation of full sentence]"}
      ]
    },
    {
      "key": "reading",
      "title": "Part 3 · Reading",
      "instructions": "Read each passage, then answer the questions.",
      "passages": [
        {"passage": "[4-6 sentence {{LANGUAGE}} passage using the lesson's grammar]", "passage_en": "[English translation]", "questions": [ {"type": "multiple_choice", "question": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."} ]}
      ]
    },
    {
      "key": "speaking",
      "title": "Part 4 · Speaking",
      "instructions": "Answer each prompt out loud in {{LANGUAGE}}. Record or practice with your teacher.",
      "prompts": [ {"prompt_jp": "[question in {{LANGUAGE}}]", "prompt_en": "[English]", "hint": "[which grammar/vocab from the lesson to use]"} ]
    }
  ]
}

REQUIRED LENGTH — this is a full practice exam, not a quiz. It covers {{LESSON_COUNT}} lesson(s), and the length scales with that:
- Part 1 vocabulary: exactly {{N_VOCAB}} multiple_choice questions.
- Part 2 grammar: exactly {{N_GRAMMAR_MC}} multiple_choice + {{N_GRAMMAR_FB}} fill_blank questions, covering EVERY distinct grammar point in the lesson content.
- Part 3 reading: exactly {{N_PASSAGES}} passages, each with 3-4 multiple_choice questions.
- Part 4 speaking: exactly {{N_SPEAKING}} prompts.
- Spread coverage across ALL the lessons provided — do not let one lesson dominate.

{{DIRECTIONS}}STRICT RULES:
- Questions and instructions are written in English; the tested material is in {{LANGUAGE}}.
- multiple_choice: exactly 4 options, exactly one correct, "answer" is the 0-based index of the correct option. Vary the correct index — do not cluster on 0.
- Wrong options must be plausible (common learner mistakes), not silly.
- fill_blank: exactly 3 options; "answer" must match one option character-for-character.
- "explanation": ONE short English sentence saying why the answer is right (shown to the teacher, and to the student after they answer).
- If the student's own language and the taught language coincide (an English test for an English learner), still keep instructions plain and simple.
- Base questions on the lesson content — vocabulary from its vocab list, grammar from its sections. Do not invent unrelated advanced material.`

/** Languages the test builder has a dedicated prompt for. */
export const TEST_LANGUAGES = ['Japanese', 'English', 'French'] as const

export async function generateTest(opts: {
  studentName: string
  lessonTitle: string
  lessonContent: string
  script?: TestScript
  /** The teacher's teaching language — decides which prompt builds the test. */
  language?: string | null
  /** How many lessons the content spans — the test's length scales with it. */
  lessonCount?: number
  /** Free-text steering from the teacher — topics to stress, tone, difficulty. */
  directions?: string | null
  /**
   * Language the questions, instructions and explanations are written in.
   * Empty or English keeps the prompt as-is. Non-Japanese tests only —
   * Japanese tests vary by script instead.
   */
  explanationLanguage?: string | null
}): Promise<TestJson> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')

  /**
   * More lessons, longer test — but sub-linearly, because a 3-lesson review
   * revisits overlapping material rather than tripling it. Capped so a
   * ten-lesson review is a long exam, not an afternoon.
   */
  const n = Math.max(1, Math.min(10, Math.round(opts.lessonCount ?? 1)))
  const scale = (base: number, per: number, cap: number) => String(Math.min(cap, base + per * (n - 1)))
  // The teacher steers content and tone; the counts and the JSON shape stay
  // ours, which is why their block sits above the strict rules, not inside.
  const directions = String(opts.directions ?? '').trim().slice(0, 600)
  const directionsBlock = directions
    ? `TEACHER'S DIRECTIONS — follow these when writing the questions (they adjust content and emphasis; they never change the JSON shape or the required counts):
"${directions}"

`
    : ''
  const fillCounts = (s: string) => s
    .replace('{{DIRECTIONS}}', directionsBlock)
    .replace('{{LESSON_COUNT}}', String(n))
    // A one-lesson test is ~20 questions, not an exam paper. Counts grow with
    // the lessons covered (so a many-lesson review is genuinely longer) but
    // sub-linearly and capped — reasonable, never exhausting.
    .replace('{{N_VOCAB}}', scale(6, 3, 16))
    .replace('{{N_GRAMMAR_MC}}', scale(6, 3, 16))
    .replace('{{N_GRAMMAR_FB}}', scale(5, 2, 12))
    .replace('{{N_PASSAGES}}', scale(1, 1, 3))
    .replace('{{N_SPEAKING}}', scale(3, 1, 8))

  // Japanese keeps its dedicated JLPT prompt (script rules and all); English
  // and French share the CEFR prompt. Anything else falls back to Japanese
  // behaviour only if it literally says Japanese — otherwise generic.
  const lang = (opts.language ?? 'Japanese').trim()
  const isJapanese = /japanese/i.test(lang) || lang === ''

  // Like the recap's explanationOverride: one trailing block re-scopes the
  // prompt's English literals instead of parametrising each. Japanese tests
  // are excluded — their per-student knob is the script picker.
  const native = String(opts.explanationLanguage ?? '').trim()
  const testOverride = !isJapanese && native && !/^(en|eng|english)$/i.test(native)
    ? `

EXPLANATION LANGUAGE — FINAL OVERRIDE, APPLIES TO EVERY RULE ABOVE:
This student is taught through ${native}, not English. Everywhere the rules above say English, write natural ${native} instead: "intro", every part's "instructions", every "question" and its options, every "explanation", every "hint", and every translation value — "en", "passage_en" and "prompt_en" now hold the ${native} translation (the KEYS stay exactly as specified).
Do NOT translate: the ${lang} material being tested (words, sentences, passages, fill_blank "before"/"after"/options/answer), CEFR level labels, part "key" values, and JSON keys — every key stays exactly as specified above.`
    : ''

  const content = (isJapanese
    ? fillCounts(TEST_PROMPT)
        .replace('{{STUDENT}}', opts.studentName)
        .replace('{{LESSON_TITLE}}', opts.lessonTitle)
        .replace('{{LESSON_CONTENT}}', opts.lessonContent)
        .replace('{{SCRIPT_RULES}}', SCRIPT_RULES[opts.script ?? 'hiragana'])
    : fillCounts(TEST_PROMPT_GENERIC)
        .replace(/\{\{LANGUAGE\}\}/g, lang)
        .replace('{{STUDENT}}', opts.studentName)
        .replace('{{LESSON_TITLE}}', opts.lessonTitle)
        .replace('{{LESSON_CONTENT}}', opts.lessonContent)) + testOverride

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 32000, // ~40 questions of JP text is token-heavy
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI failed (${res.status}): ${await res.text()}`)
  const j = await res.json()
  return pgSafeJson(JSON.parse(j.choices[0].message.content)) as TestJson
}

/**
 * The same recap, for a lesson in any language.
 *
 * The prompt above is built for Japanese: it asks for romaji readings, JLPT
 * levels and hiragana-only output, and scores "Japanese output" as part of the
 * grade. Given a French lesson it does not degrade gracefully — it invents
 * Japanese. This keeps the identical JSON shape so every page renders
 * unchanged, and swaps JLPT for CEFR.
 */
const GENERIC_PROMPT = `Analyze this {{LANGUAGE}} lesson transcript and return ONLY valid JSON.

The transcript is auto-generated from two separate microphones, so each line is already attributed to the right speaker. It may be NOISY: parts are garbled phonetic gibberish — IGNORE the gibberish and work from the clean, legible {{LANGUAGE}}, which is reliable. The meeting host is the teacher; the other speaker is the student.

CRITICAL — BE EXHAUSTIVE. Read the ENTIRE transcript start to finish and extract EVERY grammar point, verb form, and pattern that was taught or drilled, even briefly. Give the LATER HALF of the transcript equal attention — points near the end (often buried in noisy text) are commonly and wrongly dropped. Do NOT stop early or summarize only the first few. A single lesson often has 10-16 teaching points. Actively scan for these commonly-missed items and include each one you find:
- Verb tenses and aspect: past, imperfect/preterite, perfect, future, progressive
- Mood: conditional, subjunctive, imperative
- Agreement: gender, number, adjective and participle agreement
- Pronouns: object, reflexive, relative, demonstrative
- Prepositions and the fixed expressions built on them
- Negation patterns
- Comparatives and superlatives
- Conditionals and hypotheticals
- Reported speech
- Question formation and word order
- Articles and determiners
- Set phrases, idioms and natural fillers
- Register: formal vs informal address
Every point that has clean evidence in the transcript MUST get its own section. Missing a point that was clearly taught is a failure.

DO NOT OVER-SPLIT one grammar family: put all members of a single family (for example every irregular past form drilled, or every reflexive verb) together in ONE section, listing them as multiple examples inside it — never one section per word. That frees room to cover the OTHER distinct points.

Before writing, mentally list every distinct teaching point with transcript evidence, then output ONE section for EACH. If the transcript shows it, it gets its own section — do not drop it to save space.

EQUALLY CRITICAL — CAPTURE WHAT THE LESSON WAS ABOUT, NOT ONLY ITS GRAMMAR. Grammar sections alone are NOT a faithful recap of a conversation lesson. Identify what actually happened, in order:
- Any material read or worked through together — an article, text, dialogue, or exercise sheet. Say what it was about and pull out its key facts and figures (e.g. "an article about a survey on changing jobs — two thirds of respondents…"). Reading a text together is one of the most common lesson activities and one of the most commonly, wrongly omitted.
- Any topics DISCUSSED — opinions, personal experiences, culture comparisons, current events. Name the topic and what the student said about it.
- Any other activities: listening practice, role-play, pronunciation work, homework review, test preparation.
These become the FIRST sections of the recap (see SECTION FORMAT). A recap that never mentions the article that was read or the discussion that filled half the lesson is WRONG, even if every grammar point is listed.

Student: {{STUDENT}}

Return this exact structure. Replace ALL bracketed placeholders with calculated values — never copy placeholder text:
{
  "lesson_title": "[short clean lesson title — follow LESSON TITLE rules below]",
  "recap": "[Full formatted lesson recap — follow RECAP FORMAT below]",
  "score": [calculated 0.0-10.0],
  "talk_percentage": [estimated integer 0-100],
  "grammar_density": "[Low or Medium or Medium-High or High]",
  "confidence_label": "[result of weighted formula below]",
  "teacher_note": "[warm 2-3 sentence personal note to this student]",
  "audio_script": "[voice memo script — follow AUDIO SCRIPT rules below]",
  "vocab_total_count": [integer — total distinct vocabulary items in this lesson],
  "vocab_level_distribution": {"A1": [count], "A2": [count], "B1": [count], "B2": [count], "C1": [count], "C2": [count]},
  "vocabulary": [{"word": "[{{LANGUAGE}}]", "reading": "[pronunciation guide]", "definition": "[English.]", "explanation": "[1-2 warm sentences]", "jlpt_level": "[A1/A2/B1/B2/C1/C2]", "example_sentence": "[{{LANGUAGE}} sentence]"}],
  "vocabulary_all": [{"word": "[{{LANGUAGE}}]", "level": "[A1/A2/B1/B2/C1/C2]"}],
  "homework": [],
  "exercises": [{"type": "[speak|multiple_choice|fill_blank]", "prompt": "[short instruction]", "data": {}}],
  "sections": [{"title": "[see SECTION FORMAT — content/activity sections FIRST, then grammar]", "content": "[see SECTION FORMAT]"}],
  "corrections": [{"said": "[verbatim student quote]", "correction": "[fixed]", "categories": ["[label]"], "explanation": "[one sentence]"}],
  "did_well": [{"said": "[verbatim student quote]", "note": "[one sentence]"}]
}

HOMEWORK: ALWAYS the empty array []. Homework is the teacher's own to assign — never invent it, even if homework was mentioned in the lesson.

SCORING:
- score: Student accuracy, grammar, fluency, engagement. 0.0-10.0 one decimal.
- talk_percentage: Count turns. Estimate student share of speaking time. Integer 0-100.
- grammar_density: Amount of new/complex grammar. Low / Medium / Medium-High / High.

CONFIDENCE — weighted formula:
Self-correction (30%) + Response independence (25%) + Grammar recognition (20%) + {{LANGUAGE}} output (15%) + Difficulty handled (10%)
0.0-3.9 = Developing | 4.0-5.9 = Building | 6.0-7.9 = Strong Foundation | 8.0-10.0 = Confident

{{VOCAB_INVENTORY_RULES}}

VOCABULARY DETECTION — for vocab_total_count and vocab_level_distribution:
- These must AGREE with "vocabulary_all": vocab_total_count is its length, and vocab_level_distribution is its items counted per CEFR level. Do not estimate them separately.
- Include all 6 levels even if a count is 0.

LESSON TITLE — for the "lesson_title" field:
A short, clean, student-facing title (3-7 words, English, Title Case) naming what the lesson covered — like a textbook chapter heading. Examples: "Contrasting Ideas & Giving Reasons", "Making Comparisons and Strong Advice", "Talking About the Past". NO student/teacher names, NO dates, NO lesson numbers, NO quotes.

RECAP FORMAT — for the "recap" field:
Write a SHORT overview only — 2 to 3 sentences, max ~55 words. Name what the lesson actually consisted of — the material read (and its subject), the topics discussed — and what the student practiced, in a warm, plain, student-friendly voice. This is a quick summary shown above the detailed sections, so DO NOT include a title line, example sentences, pronunciation blocks, vocab lists, bullet points, or a "Main takeaway" — all of that lives in the sections and other fields. Just a compact paragraph.

SECTION FORMAT — two kinds of sections, numbered continuously, CONTENT sections FIRST.

MANDATORY LAYOUT for the "content" string of EVERY section, both kinds. Each element goes on its OWN line — put real newlines inside the JSON string; NEVER run bullets, examples, or callouts together into one paragraph:
- Start with 1-3 short plain English sentences.
- Vocab bullets, ONE PER LINE: - **word in {{LANGUAGE}}** *pronunciation* — English meaning
- Pronunciation is a plain-letter respelling a learner can read aloud (e.g. "zhuh voo-DREH" for "je voudrais") — NEVER IPA symbols (ʒ, ɛ̃, ʁ…), which read as gibberish to students.
- Example sentences as a block, one sentence per line.
- Grammar callouts on their own line: **Pattern:** structure
- Tips on their own line: Natural note: text OR Important: text
- NO sub-headers. SHORT sentences only.
A section whose bullets and Pattern line are glued into one paragraph is WRONG — the app renders each line separately and the formatting is lost.

(A) CONTENT sections — one per activity or discussion topic (typically 1-4), in lesson order. Title: "Activity: Subject", e.g. "1. Reading: Japan Work Survey" or "2. Discussion: Working Culture and Peer Pressure". Body: 2-4 short sentences saying what the material or discussion was actually ABOUT — including its key facts and figures — and what the student did with it, then the notable expressions it introduced as vocab bullets (one per line), and 1-2 example sentences from the material as a block.
(B) GRAMMAR sections — one per DISTINCT grammar point. Include ALL of them (typically 10-16 for a full lesson) — do not cap at a small number, do not merge distinct points. Order them as they appeared in the lesson. Title: "3. {{LANGUAGE}} phrase: English" (e.g. "3. il faut que: You Have To"). Body: explanation sentences, vocab bullets, an example block, and a **Pattern:** line, per the layout above.

{{CORRECTIONS_RULES}}

AUDIO SCRIPT — for the "audio_script" field:
Write based on the recap. One paragraph per topic, no transitions between paragraphs.
Structure: Opening line "Hi [first name], great work on today's lesson." Then one paragraph per topic ({{LANGUAGE}} word [pronunciation] — meaning — short example). Personal closing line.
Total: 45-75 seconds when read aloud.

EXERCISES — generate exactly 10 practice exercises based ONLY on this lesson's grammar and vocabulary, in this order: 3 speak, 4 multiple_choice, 3 fill_blank. Every exercise drills something that actually came up in this lesson; do not pad with generic material.
Keep everything at this student's level. The JSON keys below are structural — keep them exactly as written even though the content is {{LANGUAGE}}.
The "data" object depends on "type":
- speak → prompt: "Answer out loud". A QUESTION ABOUT THIS LESSON'S CONTENT — the material read, the discussion had, the situations practiced — that the student answers in their own words using today's grammar and vocabulary. Never "read this sentence": it must require the student to produce an answer. data: {"prompt_jp": "[the question in {{LANGUAGE}}]", "prompt_en": "[English]", "hint": "[a genuine help: the pattern to reach for and 1-2 of today's words to use]"}
- multiple_choice → prompt: "Quick check". data: {"question": "[question in English about this lesson]", "options": ["[opt1]", "[opt2]", "[opt3]"], "answer": [integer index 0-2 of the correct option]}
- fill_blank → prompt: "Fill in the blank". data: {"before": "[{{LANGUAGE}} text before the gap]", "after": "[{{LANGUAGE}} text after the gap]", "options": ["[opt1]", "[opt2]", "[opt3]"], "answer": "[the correct option, must exactly match one option]", "en": "[English translation]"}

VOCABULARY RULES:
- Include exactly 10 vocabulary words, drawn from what was actually said.
- "reading": a pronunciation guide in plain letters a learner can read aloud (e.g. "zhuh voo-DREH") — NEVER IPA symbols. Where the spelling is already phonetic, repeat the word. Never empty.
- "definition": short English meaning ending with a period.
- "explanation": 1-2 short warm sentences.

CEFR LEVEL — STRICT RULES:
Anchor: A1: greetings, numbers, everyday nouns, basic present tense | A2: past tense, simple connectors, routine description | B1: opinions, conditionals, common abstract nouns | B2: complex moods, nuanced connectors, formal register | C1: idiomatic and literary usage | C2: rare, specialist or literary only.
1. Everyday conversational words belong at B1 or below.
2. Cultural nuance or formality does NOT raise the level.
3. When unsure between B1 and B2, always choose B1.
4. Only assign C1 or C2 if absent from a standard B2-level textbook.

IF THIS TRANSCRIPT IS NOT A LESSON:
Say so plainly. Set score to 0, leave vocabulary, sections, homework, exercises, corrections and did_well empty, and use "recap" to state in one sentence what the recording actually contains. Never invent teaching that did not happen.

Transcript:
{{TRANSCRIPT}}`

/**
 * Wanted when the teacher explains in something other than English — empty
 * string otherwise, so the base prompts stay byte-identical for everyone else.
 *
 * Both recap prompts hardcode English as the language the material is
 * EXPLAINED in, across dozens of literals (definitions, section prose,
 * exercise instructions, the "en" translation values). Rather than
 * parametrising every one, a single trailing override re-scopes them: it sits
 * directly above the transcript, where it reliably wins over the earlier
 * literals.
 */
function explanationOverride(target: string, native: string): string {
  if (!native || /^(en|eng|english)$/i.test(native)) return ''
  return `EXPLANATION LANGUAGE — FINAL OVERRIDE, APPLIES TO EVERY RULE ABOVE:
This teacher explains lessons in ${native}, not English. Everywhere the rules above say English, write natural ${native} instead: "lesson_title", "recap", "teacher_note", "audio_script", every section's explanatory sentences and the descriptive half of its title, every vocabulary "definition" and "explanation", every correction "explanation" and did_well "note", every exercise "prompt", every multiple_choice "question" and its options, every "hint" and "focus", and every translation value — "en", "prompt_en" and read_aloud "en" values now hold the ${native} translation (the KEYS stay exactly "en"/"prompt_en").
Do NOT translate: the ${target} lesson material itself (words, phrases, example sentences, verbatim "said" quotes), pronunciation readings, CEFR/JLPT level labels, and JSON keys — every key stays exactly as specified above.`
}

export async function generateRecap(opts: {
  studentName: string
  transcript: string
  /** Target language. Anything but Japanese uses the CEFR prompt. */
  language?: string
  /** Language the teacher explains in. Empty or English keeps the prompt as-is. */
  instructionLanguage?: string | null
  /**
   * How this student reads Japanese. Ignored for every other language, and
   * absent means 'hiragana' — the behaviour every existing recap already had.
   */
  script?: TestScript | null
}): Promise<Recap> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')

  const lang = (opts.language || '').trim()
  // Absent language keeps the existing behaviour, so the bot path is untouched.
  const isJapanese = !lang || /^(ja|jp|japanese|日本語)$/i.test(lang)
  const override = explanationOverride(isJapanese ? 'Japanese' : lang, String(opts.instructionLanguage ?? '').trim())
  const content = (isJapanese ? PROMPT : GENERIC_PROMPT.replace(/\{\{LANGUAGE\}\}/g, lang))
    .replace('{{RECAP_SCRIPT_RULES}}', RECAP_SCRIPT_RULES[opts.script ?? 'hiragana'])
    .replace('{{VERBATIM_EXEMPTION}}', VERBATIM_EXEMPTION)
    .replace('{{CORRECTIONS_RULES}}', CORRECTIONS_RULES)
    .replace('{{VOCAB_INVENTORY_RULES}}', VOCAB_INVENTORY_RULES)
    .replace('{{STUDENT}}', opts.studentName)
    // The override goes just above the transcript, not after it — the last
    // instruction the model reads before the raw material it applies to.
    .replace('Transcript:', override ? `${override}\n\nTranscript:` : 'Transcript:')
    .replace('{{TRANSCRIPT}}', opts.transcript)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 32000, // room for all sections + vocab + exercises + audio script (JP is token-heavy)
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI failed (${res.status}): ${await res.text()}`)
  const j = await res.json()
  // Asking for verbatim quotes means the model sometimes copies junk out of a
  // noisy transcript, and a single NUL makes the whole recap unstorable.
  const recap = pgSafeJson(JSON.parse(j.choices[0].message.content)) as Recap
  recap.corrections = cleanCorrections((recap as any).corrections)
  recap.did_well = cleanStrengths((recap as any).did_well)
  return recap
}

/**
 * Re-render an existing recap's explanations into another language.
 *
 * For drafts generated before the teacher set an explanation language: one
 * completion rewrites the explanatory prose in place. Everything measured or
 * quoted — scores, metrics, vocab counts, verbatim quotes — is copied back
 * from the original afterwards, so translation cannot drift a number.
 */
export async function translateRecap(recap: Recap, opts: { native: string; target?: string | null }): Promise<Recap> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')

  const target = String(opts.target ?? '').trim() || 'the language being taught'
  const content = `Below is a language-lesson recap as JSON. The lesson teaches ${target}; the explanations are currently written in the wrong language. Rewrite the JSON so that ALL explanatory prose is natural ${opts.native}: "lesson_title", "recap", "teacher_note", "audio_script", every section's explanatory sentences and the descriptive half of its title, every vocabulary "definition" and "explanation", every correction "explanation" and did_well "note", every exercise "prompt", every multiple_choice "question" and its options, every "hint" and "focus", and every translation value ("en", "prompt_en" — the keys themselves never change).

Do NOT change: the ${target} material itself (words, phrases, example sentences, verbatim "said" quotes), pronunciation readings, level labels, numbers, and the JSON structure — return the COMPLETE JSON with exactly the same keys and array lengths, nothing added or dropped.

IF ${opts.native} IS THE SAME LANGUAGE AS ${target} (explanations in the language being taught), translating naively destroys the teaching — guard against it:
- A vocabulary "definition" must NEVER merely repeat the word. Define it with a short paraphrase in simpler ${opts.native} a beginner already knows (e.g. for "acheter": "payer pour avoir quelque chose").
- Same for vocab bullets inside sections: word, then a simple-words paraphrase — never the word twice.
- Any question shaped like "How do you say X in ${target}?" becomes self-answering once translated. Rephrase it to test something real (the form, the article, the word order, the right verb) and make sure no question contains its own correct answer verbatim.
- Translation values ("en", "prompt_en") that would now equal their source sentence should instead give a simpler rephrasing or a short gloss.

${JSON.stringify(recap)}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 32000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI failed (${res.status}): ${await res.text()}`)
  const j = await res.json()
  const out = pgSafeJson(JSON.parse(j.choices[0].message.content)) as any

  // Nothing the model merely had to copy is trusted to survive the round trip.
  for (const k of ['score', 'talk_percentage', 'metrics', 'grammar_density', 'confidence_label', 'vocab_total_count', 'vocab_level_distribution', 'vocabulary_all'] as const) {
    if ((recap as any)[k] !== undefined) out[k] = (recap as any)[k]
  }
  out.corrections = cleanCorrections(out.corrections)
  out.did_well = cleanStrengths(out.did_well)
  return out as Recap
}

/**
 * Keep only corrections that are actually usable.
 *
 * A correction whose quote equals its fix teaches nothing, and one missing
 * either half renders as a blank card — both are worse than one fewer item.
 */
export function cleanCorrections(raw: unknown): Correction[] {
  if (!Array.isArray(raw)) return []
  const allowed = new Set<string>(CORRECTION_CATEGORIES as readonly string[])
  const out: Correction[] = []
  for (const c of raw) {
    if (!c || typeof c !== 'object') continue
    const said = String((c as any).said ?? '').trim()
    const correction = String((c as any).correction ?? '').trim()
    if (!said || !correction || said === correction) continue
    const categories = (Array.isArray((c as any).categories) ? (c as any).categories : [])
      .map((x: unknown) => String(x ?? '').trim())
      .filter((x: string) => allowed.has(x))
      .slice(0, 2)
    out.push({
      said,
      correction,
      categories,
      explanation: String((c as any).explanation ?? '').trim(),
    })
  }
  return out.slice(0, 12)
}

export function cleanStrengths(raw: unknown): Strength[] {
  if (!Array.isArray(raw)) return []
  const out: Strength[] = []
  for (const s of raw) {
    if (!s || typeof s !== 'object') continue
    const said = String((s as any).said ?? '').trim()
    const note = String((s as any).note ?? '').trim()
    if (!said || !note) continue
    out.push({ said, note })
  }
  return out.slice(0, 6)
}
