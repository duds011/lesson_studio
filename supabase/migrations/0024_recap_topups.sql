-- Top-up recaps: extras a teacher buys when the month's allowance runs out.
-- A counter, not a monthly limit — they never expire, and the quota code only
-- spends one when a build lands beyond the plan's monthly recaps.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recap_topup_credits INTEGER NOT NULL DEFAULT 0;
