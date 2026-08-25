-- The language actually SPOKEN in the recorded lesson, carried from
-- pending_recordings when the teacher files a recording. Without it, a
-- rebuild of a filed recording handed Whisper the TARGET language instead —
-- which does not skip the shared-language parts of a beginner lesson, it
-- renders them as target-language nonsense.
ALTER TABLE lesson_event_links ADD COLUMN IF NOT EXISTS spoken_language TEXT;
