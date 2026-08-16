-- A student can exist before anyone knows their email address.
--
-- Teachers who find students on Preply or italki have a chat with them but no
-- address, and the old flow made the teacher invent one, pick the student's
-- password, and read it out. Now the row is created with a name and an invite
-- code; the student supplies their own email and password when they open the
-- link, so the teacher never handles either.
--
-- The UNIQUE constraint on email stays as it is — Postgres allows any number
-- of NULLs in a unique index, so unclaimed students do not collide.
alter table students alter column email drop not null;

alter table students add column if not exists invite_code text;
alter table students add column if not exists invite_created_at timestamptz;

-- Single-use: the claim clears the code, so a spent or shared link cannot be
-- replayed against a student who has already joined. Partial, because every
-- claimed student holds NULL here and those must not collide either.
create unique index if not exists students_invite_code_key
  on students (invite_code) where invite_code is not null;
