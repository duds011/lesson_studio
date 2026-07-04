-- Payments (manual bookkeeping) + bookings (lesson-credit ledger) + teacher currency.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  teacher_id      UUID REFERENCES auth.users(id) NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending')),
  description     TEXT,
  lessons_covered INTEGER,
  payment_date    DATE,
  due_date        DATE,
  method          TEXT,
  category        TEXT DEFAULT 'student' CHECK (category IN ('student','trial','other')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  teacher_id      UUID REFERENCES auth.users(id) NOT NULL,
  start_utc       TIMESTAMPTZ NOT NULL,
  end_utc         TIMESTAMPTZ,
  google_event_id TEXT,
  meeting_url     TEXT,
  status          TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_teacher" ON payments FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "bookings_teacher" ON bookings FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "bookings_student" ON bookings FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE INDEX idx_payments_teacher ON payments(teacher_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_teacher ON bookings(teacher_id);
