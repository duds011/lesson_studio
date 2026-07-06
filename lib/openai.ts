/**
 * OpenAI recap generation — schema + prompt mirror the live n8n workflow
 * "GENOA_Drive_Monitor" so recaps match the teacher-portal / GENOA Library format.
 * Input here is a diarized meeting transcript (Recall) instead of a Drive doc.
 */
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

export type Recap = {
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
  homework: { description: string }[]
  exercises: Exercise[]
  sections: Section[]
}

const PROMPT = `Analyze this Japanese lesson transcript and return ONLY valid JSON.

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

Student: {{STUDENT}}

Return this exact structure. Replace ALL bracketed placeholders with calculated values — never copy placeholder text:
{
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
  "homework": [{"description": "[task]"}],
  "exercises": [{"type": "[read_aloud|speak|multiple_choice|fill_blank]", "prompt": "[short instruction]", "data": {}}],
  "sections": [{"title": "1. Japanese: English Title", "content": "[see SECTION FORMAT]"}]
}

SCORING:
- score: Student accuracy, grammar, fluency, engagement. 0.0-10.0 one decimal.
- talk_percentage: Count turns. Estimate student share of speaking time. Integer 0-100.
- grammar_density: Amount of new/complex grammar. Low / Medium / Medium-High / High.

CONFIDENCE — weighted formula:
Self-correction (30%) + Response independence (25%) + Grammar recognition (20%) + Japanese output (15%) + Difficulty handled (10%)
0.0-3.9 = Developing | 4.0-5.9 = Building | 6.0-7.9 = Strong Foundation | 8.0-10.0 = Confident

VOCABULARY DETECTION — for vocab_total_count and vocab_level_distribution:
- Count ALL distinct vocabulary items that appeared or were practiced in this lesson — not just the 10 key items.
- Include words, grammar patterns, particles, expressions, set phrases, and counter words.
- vocab_total_count: total number of distinct items found.
- vocab_level_distribution: count of items per JLPT level. Include all 5 levels even if count is 0.

RECAP FORMAT — for the "recap" field:
Create a lesson recap for the student. Clear, practical, student-friendly. Include romaji for all Japanese. Use 3-line format for examples:
  Japanese sentence
  Romaji
  English meaning
Title: "Lesson Recap — [main topic]". End with a short Main takeaway section. Remove off-topic content.

SECTION FORMAT — one section per DISTINCT grammar point/topic. Include ALL of them (typically 10-16 for a full lesson) — do not cap at a small number, do not merge distinct points. Order them as they appeared in the lesson.
- Title: "1. Japanese: English" (e.g. "1. いきます: To Go Somewhere")
- Start with 1-3 short plain English sentences.
- Vocab bullets: - **hiragana** *romaji* — English meaning
- Example sentences as 3-line blocks.
- Grammar callouts: **Pattern:** structure
- Tips: Natural note: text OR Important: text
- NO sub-headers. SHORT sentences only.

LAST SECTION — REQUIRED — titled exactly "Main Corrections & Refinements":
8-10 bullet points only. Each bullet: **hiragana word or pattern** / romaji: one short English sentence (max 12 words).
All Japanese in hiragana only. NEVER use kanji.

AUDIO SCRIPT — for the "audio_script" field:
Write based on the recap. One paragraph per topic, no transitions between paragraphs.
Structure: Opening line "Hi [first name], great work on today's lesson." Then one paragraph per topic (hiragana [romaji] — meaning — short example). Homework sentence. Personal closing line.
Total: 45-75 seconds when read aloud.

EXERCISES — generate exactly 7 interactive homework exercises based ONLY on this lesson's grammar and vocabulary, in this order: 1 read_aloud, 1 speak, 3 multiple_choice, 2 fill_blank.
All Japanese in hiragana/katakana only — NEVER kanji. Keep everything at this student's level.
The "data" object depends on "type":
- read_aloud → prompt: "Read these sentences aloud". data: {"focus": "[grammar focus]", "sentences": [{"jp": "[hiragana sentence]", "en": "[English]"}, {"jp":"...","en":"..."}, {"jp":"...","en":"..."}]}
- speak → prompt: "Answer out loud". data: {"prompt_jp": "[a question in hiragana]", "prompt_en": "[English]", "hint": "[which grammar/words to use]"}
- multiple_choice → prompt: "Quick check". data: {"question": "[question in English about this lesson]", "options": ["[opt1]", "[opt2]", "[opt3]"], "answer": [integer index 0-2 of the correct option]}
- fill_blank → prompt: "Fill in the blank". data: {"before": "[hiragana text before the gap]", "after": "[hiragana text after the gap]", "options": ["[opt1]", "[opt2]", "[opt3]"], "answer": "[the correct option, must exactly match one option]", "en": "[English translation]"}

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

export async function generateRecap(opts: { studentName: string; transcript: string; whiteboard?: string }): Promise<Recap> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')

  // The teacher and student may have written on a shared lesson doc/whiteboard;
  // fold its notes into the analysis (grammar points, vocab, examples written there).
  const wb = (opts.whiteboard ?? '').trim()
  const transcriptBlock = wb
    ? `${opts.transcript}\n\n---\nSHARED LESSON DOC / WHITEBOARD (notes the teacher & student wrote during the lesson — treat as authoritative for spelling and any grammar/vocab written here, and include them):\n${wb}`
    : opts.transcript
  const content = PROMPT.replace('{{STUDENT}}', opts.studentName).replace('{{TRANSCRIPT}}', transcriptBlock)

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
  return JSON.parse(j.choices[0].message.content) as Recap
}
