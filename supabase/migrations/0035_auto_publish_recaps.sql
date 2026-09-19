-- Send recaps to students without the teacher reviewing them first.
--
-- The review queue exists because a generated recap can be wrong, and a
-- teacher's name is on it. That is the right default and stays the default:
-- this column is false unless a teacher opts in.
--
-- Some teachers will never review. They record, the draft sits in the queue,
-- and the student gets nothing — which is worse than an unreviewed recap,
-- because the lesson was recorded and paid for either way. Opting in swaps a
-- silent nothing for something imperfect that arrives.
alter table public.profiles
  add column if not exists auto_publish_recaps boolean not null default false;

comment on column public.profiles.auto_publish_recaps is
  'When true, a finished recap is published and delivered to the student immediately instead of waiting in the review queue. Off by default.';
