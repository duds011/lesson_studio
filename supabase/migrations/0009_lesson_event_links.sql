-- Manual/explicit link between a Google calendar event and a student, so the
-- teacher can attach any lesson (incl. ones that don't auto-match by booking or
-- attendee email) to a student for the live doc + recap. Takes priority over
-- the automatic booking/email match.
CREATE TABLE lesson_event_links (
  event_id   TEXT PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE lesson_event_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links_teacher" ON lesson_event_links FOR ALL USING (teacher_id = auth.uid());
CREATE INDEX idx_lesson_event_links_teacher ON lesson_event_links(teacher_id);
