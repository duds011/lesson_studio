-- Whether a teacher wants their students to record the recap's speaking
-- exercises. On by default: the exercises are already written into every
-- recap, and a teacher who doesn't want the audio turns them off here.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS speaking_submissions BOOLEAN NOT NULL DEFAULT TRUE;

-- Debounce for "your student recorded something" mail. A student who works
-- through all three exercises in one sitting is one event, not three.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS speaking_notified_at TIMESTAMPTZ;

-- One take per exercise: a re-record replaces, so the teacher hears the
-- student's best attempt rather than a pile of false starts. Partial, because
-- free-form practice audio for a lesson carries no prompt_index and there may
-- be any number of those.
CREATE UNIQUE INDEX IF NOT EXISTS idx_audio_lesson_prompt
  ON student_audio_submissions(lesson_id, prompt_index)
  WHERE lesson_id IS NOT NULL AND prompt_index IS NOT NULL;
