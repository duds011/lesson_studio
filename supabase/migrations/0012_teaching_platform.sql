-- Where the teacher actually meets students.
--
-- meeting_platform already existed, but it only ever answered "which link do
-- we create when a student books" — Google Meet or Zoom. A teacher who works
-- through Preply or another marketplace has neither: the lesson happens on
-- someone else's platform, so nothing is created and there may be no calendar
-- at all. That is a different answer to a different question, so it gets its
-- own column, and meeting_platform gains 'none' for "I share my own link".

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS teaching_platform TEXT;

-- Existing teachers keep meeting where they already meet.
UPDATE profiles
   SET teaching_platform = meeting_platform
 WHERE teaching_platform IS NULL
   AND role = 'teacher';
