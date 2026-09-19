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
  'Interface locale. Shipping en/fr/ja; the check allows more so adding one needs no migration. Null = follow the browser. Not the recap language — that is students.instruction_language.';

-- A guard against garbage, NOT a copy of the product decision.
--
-- The app ships three interfaces today (en/fr/ja) and the server action
-- validates against that list, so nothing else can get in through the UI.
-- This constraint stays wider so that adding a language later is four edits
-- in TypeScript and a translate run, with no schema change and no deploy
-- ordering to think about. A value in here that the app cannot render falls
-- back to English rather than breaking — see the Partial DICTS in
-- lib/i18n/index.ts.
alter table public.profiles
  drop constraint if exists profiles_ui_language_check;

alter table public.profiles
  add constraint profiles_ui_language_check
  check (ui_language is null or ui_language in ('en','es','pt','fr','ja','de','it'));
