-- Who held the mic, remembered per recording. Rebuilds used to assume the
-- teacher recorded, which flipped every speaker label on a lesson a student
-- recorded of themselves (mic = student, tab = their teacher).
ALTER TABLE lesson_event_links ADD COLUMN IF NOT EXISTS mic_is TEXT CHECK (mic_is IN ('teacher','student'));

-- Backfill the one recording known to be student-held: Duarte recorded his
-- own Preply French lesson (verified by listening to the tracks).
UPDATE lesson_event_links SET mic_is = 'student' WHERE event_id = 'ext:f28af0c3-9fb1-41d1-beeb-c8ae44f437ae';
