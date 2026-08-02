-- Teacher onboarding + student-portal branding.
--
-- A new teacher signs up to a clean workspace and is walked through a short
-- setup: what they teach, where they meet students, and connecting their
-- calendar. `onboarding_completed_at` gates the rest of the teacher app.
--
-- `brand` holds everything a teacher can customise about the view their
-- students see. It is JSONB so the toolkit can grow without a migration each
-- time; lib/brand.ts owns the defaults and the shape.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS teaching_language      TEXT,
  ADD COLUMN IF NOT EXISTS meeting_platform       TEXT NOT NULL DEFAULT 'google_meet',
  ADD COLUMN IF NOT EXISTS timezone               TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  ADD COLUMN IF NOT EXISTS onboarding_step        SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand                  JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Students read their teacher's brand to render their own portal. Without this
-- they cannot see the teacher's profile row at all (RLS blocks cross-profile
-- reads), so the portal would always fall back to defaults.
DROP POLICY IF EXISTS "profiles_student_reads_teacher_brand" ON profiles;
CREATE POLICY "profiles_student_reads_teacher_brand" ON profiles FOR SELECT
  USING (
    id IN (SELECT teacher_id FROM students WHERE profile_id = auth.uid())
  );

COMMENT ON COLUMN profiles.brand IS
  'Student-portal customisation: accent, headline, welcome, logo_url, and section toggles. Shape owned by lib/brand.ts.';
