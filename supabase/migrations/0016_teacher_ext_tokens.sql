-- One extension token per teacher, so the recorder knows whose lesson it is.
--
-- Deliberately NOT a column on profiles: students are allowed to read their
-- teacher's profile row (for branding), and an RLS SELECT policy grants the
-- whole row, so a token stored there would be readable by every student.
create table if not exists teacher_ext_tokens (
  teacher_id uuid primary key references profiles(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table teacher_ext_tokens enable row level security;

-- Owner only, in both directions. The extension authenticates server-side with
-- the service role, which bypasses this.
create policy ext_token_own on teacher_ext_tokens
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
