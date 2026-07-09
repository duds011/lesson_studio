-- Teacher <-> student content exchange: teacher files + student audio.
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-files', 'lesson-files', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('student-audio', 'student-audio', false) ON CONFLICT (id) DO NOTHING;

CREATE TABLE lesson_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  uploaded_by  UUID REFERENCES auth.users(id) NOT NULL,
  bucket       TEXT NOT NULL DEFAULT 'lesson-files',
  path         TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  content_type TEXT,
  size_bytes   BIGINT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_audio_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  bucket       TEXT NOT NULL DEFAULT 'student-audio',
  path         TEXT NOT NULL,
  file_name    TEXT,
  content_type TEXT,
  size_bytes   BIGINT,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_audio_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attach_teacher" ON lesson_attachments FOR ALL
  USING (lesson_id IN (SELECT id FROM lessons WHERE teacher_id = auth.uid()));
CREATE POLICY "attach_student" ON lesson_attachments FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE POLICY "audio_student" ON student_audio_submissions FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));
CREATE POLICY "audio_teacher" ON student_audio_submissions FOR SELECT
  USING (lesson_id IN (SELECT id FROM lessons WHERE teacher_id = auth.uid()));

CREATE INDEX idx_attach_lesson ON lesson_attachments(lesson_id);
CREATE INDEX idx_audio_lesson ON student_audio_submissions(lesson_id);
CREATE INDEX idx_audio_student ON student_audio_submissions(student_id);
