-- One row per finished practice round, so the portal can show a history.
--
-- flashcard_reviews already carries where every card stands (box, reviews,
-- lapses, last_reviewed_at), but it holds one row per CARD and only its most
-- recent touch. That is enough to say "42 words known" and nothing at all
-- about last Tuesday: practise a card again today and the day you first met it
-- is overwritten. A streak or a "this week" chart read off that table would be
-- quietly wrong, which is worse than absent.
--
-- So: an append-only log of rounds. Small — a student doing two rounds a day
-- writes ~700 rows a year — and it is the only place a day can be counted.
CREATE TABLE IF NOT EXISTS flashcard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  -- What the round was drawn from, for "you have been avoiding the verbs".
  -- Both null means the whole collection.
  deck TEXT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  cards SMALLINT NOT NULL,
  -- Answered right first time. cards - correct is what came back around.
  correct SMALLINT NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fcs_student_ended
  ON flashcard_sessions(student_id, ended_at DESC);

ALTER TABLE flashcard_sessions ENABLE ROW LEVEL SECURITY;

-- A student writes and reads their own rounds. Nothing updates or deletes:
-- this is a log, and a practice history you can edit is not a history.
DROP POLICY IF EXISTS "fcs_student_read" ON flashcard_sessions;
CREATE POLICY "fcs_student_read" ON flashcard_sessions FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "fcs_student_write" ON flashcard_sessions;
CREATE POLICY "fcs_student_write" ON flashcard_sessions FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

-- The teacher who owns the student can see how practice is going, not change it.
DROP POLICY IF EXISTS "fcs_teacher" ON flashcard_sessions;
CREATE POLICY "fcs_teacher" ON flashcard_sessions FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid()));
