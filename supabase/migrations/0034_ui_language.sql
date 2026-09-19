-- What language a teacher reads the app in.
--
-- Null means "not asked yet", which is different from English: a null falls
-- back to the browser's Accept-Language on every render, so a teacher who
-- arrived from the French marketing site sees a French app without ever
-- opening Settings. Writing 'en' into the column is a real choice — it pins
-- English even on a French browser — so the two states must stay distinct.
--
-- Students deliberately have no column here. They already set
-- students.instruction_language, which is the language they read most
-- comfortably; the portal follows it. A second setting could disagree with
-- the first, and "recap in Portuguese, page in English" is the exact state
-- this feature exists to remove.
alter table public.profiles
  add column if not exists ui_language text;

comment on column public.profiles.ui_language is
  'Interface locale (en/es/pt/fr/ja/de/it). Null = follow the browser. Not the recap language — that is students.instruction_language.';

-- Only a language the interface is actually built in. Free text here would
-- reach getDict and silently fall back to English, which looks like a bug
-- rather than an unsupported language.
alter table public.profiles
  drop constraint if exists profiles_ui_language_check;

alter table public.profiles
  add constraint profiles_ui_language_check
  check (ui_language is null or ui_language in ('en','es','pt','fr','ja','de','it'));
