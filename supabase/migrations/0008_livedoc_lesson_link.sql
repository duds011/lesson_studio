-- Wire the live doc to real lessons: store rendered content for the recap +
-- AI, and let a published recap map back to the calendar event it came from.
ALTER TABLE lesson_docs ADD COLUMN IF NOT EXISTS content_html TEXT;
ALTER TABLE lesson_docs ADD COLUMN IF NOT EXISTS content_text TEXT;
ALTER TABLE lesson_docs ADD COLUMN IF NOT EXISTS active_event_id TEXT;

-- A published recap creates/updates one lesson per source calendar event.
-- Plain UNIQUE (nullable → multiple NULLs allowed) so it works as an upsert
-- ON CONFLICT target for existing/seeded lessons that have no source event.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS source_event_id TEXT;
ALTER TABLE lessons ADD CONSTRAINT lessons_source_event_key UNIQUE (source_event_id);

-- Whiteboard snapshot shown in the student's recap "Whiteboard" tab.
ALTER TABLE lesson_summaries ADD COLUMN IF NOT EXISTS whiteboard_html TEXT;
