-- A teacher's own library of links: YouTube videos, articles, anything with a
-- URL. Owned by the teacher, not by a lesson, so it outlives the lesson it was
-- first used in and can be attached again next month.
create table if not exists teacher_materials (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references profiles(id) on delete cascade,
  url         text not null,
  title       text not null,
  -- 'video' | 'article' | 'link' — decided from the URL, drives the icon only.
  kind        text not null default 'link',
  -- Fetched once when the material is saved; null when the site gave us none.
  site        text,
  thumbnail   text,
  note        text,
  tags        text[] not null default '{}',
  -- Ordering the picker by what she actually reaches for beats alphabetical.
  use_count   integer not null default 0,
  last_used_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists teacher_materials_teacher on teacher_materials (teacher_id, last_used_at desc nulls last);
-- The same link saved twice is a mistake, not two materials.
create unique index if not exists teacher_materials_unique_url on teacher_materials (teacher_id, url);

alter table teacher_materials enable row level security;

create policy materials_teacher on teacher_materials
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- Attaching a material to a lesson SNAPSHOTS it into lesson_attachments: the
-- url and title are copied, so renaming or deleting a library item never
-- rewrites what a student was already sent.
alter table lesson_attachments add column if not exists url text;
alter table lesson_attachments add column if not exists kind text;
alter table lesson_attachments add column if not exists thumbnail text;
-- A link has no storage object behind it, so these stop being required.
alter table lesson_attachments alter column path drop not null;
alter table lesson_attachments alter column bucket drop not null;
