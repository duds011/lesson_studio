-- Teacher payment methods: how students should pay their teacher.
-- A flexible ordered list of methods (IBAN/bank, PayPal.me, Wise, Revolut,
-- Stripe payment link, other). Manual reconciliation — no processing here.
-- Shape: [{ id, type, label, value, note }]
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb;
