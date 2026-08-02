-- AI-generated student tests. The teacher generates a test from a lesson's
-- recap, reviews it as a draft, and publishes it to the student's dashboard.
-- `test_json` holds the full structured test (parts: vocabulary / grammar /
-- reading / speaking).
CREATE TABLE tests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id   UUID REFERENCES auth.users(id) NOT NULL,
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  lesson_id    UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  level        TEXT NOT NULL DEFAULT 'N5',
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  test_json    JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Teacher owns their tests; students may only read published ones sent to them.
CREATE POLICY "tests_teacher" ON tests FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "tests_student_select" ON tests FOR SELECT
  USING (status = 'published' AND student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE INDEX idx_tests_student ON tests(student_id);
CREATE INDEX idx_tests_teacher ON tests(teacher_id);
