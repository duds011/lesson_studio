-- Whether this teacher keeps their lessons on a calendar at all.
--
-- teaching_platform (0012) answers "where does the lesson happen". This answers
-- a separate question the app kept assuming: "is there a calendar for us to
-- read". A teacher whose students are all on Preply schedules nowhere we can
-- see, and until now the overview met them with a full-screen Connect-Google
-- wall they had no way past. Asking once, in onboarding, lets every calendar-
-- shaped surface (booking page, availability, the overview itself) step aside
-- for them instead.
--
--   'google' — lessons live on Google Calendar; connect it
--   'none'   — scheduled elsewhere; lessons arrive as recordings

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS calendar_mode TEXT;

-- Everyone who set up before this question existed was funnelled towards a
-- calendar, so that is what they answered by getting here.
UPDATE profiles
   SET calendar_mode = 'google'
 WHERE calendar_mode IS NULL
   AND role = 'teacher'
   AND onboarding_completed_at IS NOT NULL;
