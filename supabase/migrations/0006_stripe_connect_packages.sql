-- Stripe Connect (teacher payouts) + teacher-defined lesson packages.
-- Teacher onboards an Express connected account; students pay via Checkout
-- Sessions created on that account. Webhook records the payment → existing
-- credit math (purchased − used) tops up the student's "lessons remaining".

-- Connected account on the teacher's profile.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN NOT NULL DEFAULT false;

-- Tie Stripe-originated payments back to their Checkout Session (idempotent
-- webhook recording) and distinguish them from manually-entered ledger rows.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
  CHECK (source IN ('manual','stripe'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session
  ON payments(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- Reusable packages a teacher offers (e.g. "4 lessons — €120").
CREATE TABLE lesson_packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID REFERENCES auth.users(id) NOT NULL,
  name          TEXT NOT NULL,
  lessons_count INTEGER NOT NULL CHECK (lessons_count > 0),
  amount        NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency      TEXT NOT NULL DEFAULT 'USD',
  active        BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_packages ENABLE ROW LEVEL SECURITY;

-- Teacher manages their own packages; students may read their own teacher's
-- active packages (needed for self-serve "buy lessons").
CREATE POLICY "packages_teacher" ON lesson_packages FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "packages_student" ON lesson_packages FOR SELECT
  USING (active AND teacher_id IN (SELECT teacher_id FROM students WHERE profile_id = auth.uid()));

CREATE INDEX idx_packages_teacher ON lesson_packages(teacher_id);
