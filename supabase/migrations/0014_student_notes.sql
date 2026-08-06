-- Teacher notes, one per taught lesson (Genoa Library's notes grid, ported).
-- A note is the teacher's private record for a student on a date: what was
-- covered, what to pick up next time. One note = one lesson taught, so a
-- month of notes doubles as a timesheet.

create table if not exists student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  note_date date not null default current_date,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists student_notes_teacher_date on student_notes (teacher_id, note_date);
create index if not exists student_notes_student on student_notes (student_id);

alter table student_notes enable row level security;

-- Teacher-only, in both directions: students never see these.
create policy notes_teacher on student_notes
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
