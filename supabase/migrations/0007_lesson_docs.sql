-- Live collaborative lesson doc (Notion-style) shared by a teacher and one
-- student. One doc per student; `state` is a base64 Yjs snapshot (CRDT) so it
-- survives reloads. Real-time editing is synced over Supabase Realtime
-- broadcast; this table is just persistence. `active` = teacher has it live.
CREATE TABLE lesson_docs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES auth.users(id) NOT NULL,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title       TEXT NOT NULL DEFAULT 'Lesson notes',
  state       TEXT,
  active      BOOLEAN NOT NULL DEFAULT false,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_docs ENABLE ROW LEVEL SECURITY;

-- Teacher owns the doc; the linked student may read and edit it.
CREATE POLICY "docs_teacher" ON lesson_docs FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "docs_student_select" ON lesson_docs FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));
CREATE POLICY "docs_student_update" ON lesson_docs FOR UPDATE
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE INDEX idx_lesson_docs_teacher ON lesson_docs(teacher_id);
