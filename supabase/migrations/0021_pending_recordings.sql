-- Recordings that have arrived but do not belong to anyone yet.
--
-- The recorder used to ask which student before you pressed record, and that
-- is the one question a teacher reliably gets wrong: the dropdown holds
-- whoever it held last lesson, and nothing about a recap filed under the wrong
-- student looks wrong until much later. So the extension no longer asks. The
-- audio lands here, and the teacher files it in the studio, where the names
-- are in front of them and a mistake is one click to fix.
--
-- Nothing expensive has happened yet at this point — no transcription, no
-- completion. Filing it is what starts the build, through exactly the same
-- path as "Rebuild from recording".
create table if not exists pending_recordings (
  recording_id     uuid primary key,
  teacher_id       uuid references auth.users(id) on delete cascade not null,
  seconds          integer,
  lesson_date      date,
  mic_is           text,
  spoken_language  text,
  heard            jsonb,
  created_at       timestamptz default now() not null
);

create index if not exists pending_recordings_teacher_idx
  on pending_recordings (teacher_id, created_at desc);

alter table pending_recordings enable row level security;

-- A teacher sees their own waiting recordings. Writes go through the service
-- role: the extension is not a browser session and has no RLS identity.
create policy "teachers read own pending recordings" on pending_recordings
  for select using (auth.uid() = teacher_id);
