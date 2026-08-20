-- Every existing account is treated as a Studio subscription: 30 recaps a
-- month (the plan sold on kokulabs.net). Usage they already have on the books
-- counts against it, so the "recaps left" number every teacher now sees is
-- honest from day one.

-- Existing teachers -> Studio. New profiles stay NULL and fall through to the
-- code default, which is also 30 now (lib/recap-quota).
UPDATE profiles SET recap_monthly_limit = 30 WHERE recap_monthly_limit IS NULL;

-- Deduct the recaps that already exist as lessons on their pages. recap_runs
-- only began recording on 2026-08-16, so lessons published before a teacher's
-- first recorded run are the ones with no row yet; anything after it was
-- already counted at build time and must not be counted twice.
INSERT INTO recap_runs (teacher_id, source, created_at)
SELECT l.teacher_id, 'backfill:lesson', l.created_at
FROM lessons l
WHERE l.created_at < COALESCE(
  (SELECT min(r.created_at) FROM recap_runs r WHERE r.teacher_id = l.teacher_id),
  'infinity'::timestamptz
);
