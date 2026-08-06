-- Track every word a lesson taught, not only the ten shown on the recap.
--
-- The recap deliberately shows ten "key" words — a lesson yields far more than
-- a student wants to read. But the vocabulary TOTAL should count all of them,
-- and until now that total was a number the model estimated rather than a
-- count of anything, so it could not be checked against the words behind it.
--
-- is_key marks the ten the recap renders. Everything else is stored too and
-- counted, just not shown on the lesson page.
alter table vocabulary_items add column if not exists is_key boolean not null default false;

-- The words already stored came from the ten-word key list.
update vocabulary_items set is_key = true where is_key = false;

-- One row per word per lesson: re-publishing must not double-count, and the
-- level lookup below reads this constantly.
create index if not exists vocabulary_items_lesson_word on vocabulary_items (lesson_id, word);
