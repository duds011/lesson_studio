-- Store the full structured recap object so the tabbed lesson view
-- (Progress / Lesson / Practice / Vocabulary) can render every field
-- (sections, exercises, grammar_density, confidence_label, audio_script).
ALTER TABLE lesson_summaries ADD COLUMN IF NOT EXISTS recap_json JSONB;
