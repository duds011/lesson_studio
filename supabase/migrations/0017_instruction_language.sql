-- The language this student's recaps and tests are EXPLAINED in — distinct
-- from students.language (what they LEARN). NULL means English, which keeps
-- every existing student on the behaviour they had before this column.
alter table students add column if not exists instruction_language text;
