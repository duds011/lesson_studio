export type UserRole = 'teacher' | 'student'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface DbStudent {
  id: string
  profile_id?: string
  teacher_id: string
  full_name: string
  email: string
  level: string
  language: string
  created_at: string
}

export interface DbLesson {
  id: string
  student_id: string
  teacher_id: string
  lesson_number: number
  lesson_date: string
  title?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface DbLessonSummary {
  id: string
  lesson_id: string
  recap?: string
  score?: number
  talk_percentage?: number
  vocab_total_count?: number
  vocab_level_distribution?: Record<string, number>
  teacher_note?: string
  audio_script?: string
  updated_at: string
}

export interface DbLessonSection {
  id: string
  lesson_id: string
  title: string
  content?: string
  sort_order: number
}

export interface DbVocabularyItem {
  id: string
  lesson_id: string
  word: string
  reading?: string
  definition?: string
  explanation?: string
  example_sentence?: string
  jlpt_level?: string
  sort_order: number
}

export interface DbHomeworkItem {
  id: string
  lesson_id: string
  description: string
  completed: boolean
  sort_order: number
}

export interface StudentWithStats extends DbStudent {
  lesson_count: number
  latest_score?: number | null
  avg_score?: number | null
  latest_talk_percentage?: number | null
  total_vocab: number
  has_login: boolean
}
