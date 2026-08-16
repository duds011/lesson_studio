-- A ceiling on how many recaps one teacher can generate in a month.
--
-- Signup is open, and every recap is a paid Whisper transcription plus a large
-- OpenAI completion. Nothing stopped a stranger from signing up and running
-- hundreds of them on someone else's bill. The per-lesson caps in
-- lib/lesson-limits bound what ONE recap can cost; this bounds how many.
--
-- One row per generation attempt that actually reached the model, so rebuilds
-- of an existing lesson count too — they cost the same as the first run.
create table if not exists recap_runs (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid references auth.users(id) on delete cascade not null,
  source      text,
  created_at  timestamptz default now() not null
);

create index if not exists recap_runs_teacher_month_idx on recap_runs (teacher_id, created_at desc);

alter table recap_runs enable row level security;

-- Teachers may read their own usage; only the service role writes it, so a
-- client cannot forge or delete its own history.
create policy "teachers read own recap runs" on recap_runs
  for select using (auth.uid() = teacher_id);

-- NULL means the default in lib/recap-quota. Raise it for a teacher on a
-- bigger plan without touching code.
alter table profiles add column if not exists recap_monthly_limit integer;
