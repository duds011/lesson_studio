/**
 * Students + their lessons (file-based store).
 * A "lesson" holds the full OpenAI Recap object plus student linkage.
 */
import { promises as fs } from 'fs'
import path from 'path'
import type { Recap } from './openai'

// Committed content (available at build time for static export / Netlify).
const CONTENT_DIR = path.join(process.cwd(), 'content')
const STUDENTS_FILE = path.join(CONTENT_DIR, 'students.json')
const LESSONS_FILE = path.join(CONTENT_DIR, 'lessons.json')

export type Student = {
  id: string
  name: string
  level: string
  language: string
  email: string
}

export type Lesson = {
  id: string
  studentId: string
  lessonNumber: number
  date: string // YYYY-MM-DD
  title: string
  recap: Recap
  studentTalkPct: number | null
  status: 'draft' | 'published'
  createdAt: number
}

export async function getStudents(): Promise<Student[]> {
  try {
    const arr = JSON.parse(await fs.readFile(STUDENTS_FILE, 'utf-8')) as Student[]
    return arr.sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

export async function getStudent(id: string): Promise<Student | null> {
  return (await getStudents()).find((s) => s.id === id) ?? null
}

export async function getLessons(): Promise<Record<string, Lesson>> {
  try {
    return JSON.parse(await fs.readFile(LESSONS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

export async function getLessonsByStudent(studentId: string): Promise<Lesson[]> {
  const all = await getLessons()
  return Object.values(all)
    .filter((l) => l.studentId === studentId)
    .sort((a, b) => a.lessonNumber - b.lessonNumber)
}

export async function nextLessonNumber(studentId: string): Promise<number> {
  const lessons = await getLessonsByStudent(studentId)
  return lessons.reduce((m, l) => Math.max(m, l.lessonNumber), 0) + 1
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true })
  const all = await getLessons()
  all[lesson.id] = lesson
  await fs.writeFile(LESSONS_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

// ── Aggregations for the student profile tabs ──
export function aggregateVocab(lessons: Lesson[]) {
  const dist: Record<string, number> = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 }
  const items: { word: string; reading: string; definition: string; jlpt_level: string; lessonNumber: number }[] = []
  for (const l of lessons) {
    for (const v of l.recap.vocabulary ?? []) {
      items.push({ word: v.word, reading: v.reading, definition: v.definition, jlpt_level: v.jlpt_level, lessonNumber: l.lessonNumber })
      const lv = (v.jlpt_level || '').toUpperCase()
      if (lv in dist) dist[lv]++
    }
  }
  return { dist, items }
}

export function aggregateHomework(lessons: Lesson[]) {
  return lessons.flatMap((l) =>
    (l.recap.homework ?? []).map((h) => ({ description: h.description, lessonNumber: l.lessonNumber, date: l.date }))
  )
}

export function progressStats(lessons: Lesson[]) {
  const scores = lessons.map((l) => l.recap.score).filter((s) => typeof s === 'number')
  const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null
  const totalVocab = lessons.reduce((a, l) => a + (l.recap.vocabulary?.length ?? 0), 0)
  const series = lessons.map((l) => ({
    lessonNumber: l.lessonNumber,
    score: l.recap.score,
    talk: l.recap.talk_percentage,
  }))
  return { lessonCount: lessons.length, avgScore, totalVocab, series }
}
