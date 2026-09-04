-- What a lesson with this student is actually SPOKEN in.
--
-- The third language fact, finally living with the other two. `language` is
-- what they are learning and `instruction_language` is what their recap is
-- written in; this is what the hour SOUNDS like, which the transcriber has to
-- be told before it hears a word. It differs per student rather than per
-- teacher: a beginner's hour runs mostly in the language you share, an
-- advanced student's mostly in the target.
--
-- The recorder used to ask on every single lesson, in a dropdown beside the
-- student, and remember the answer only in that browser's local storage — so
-- it was asked again on a second machine, and lost when the extension was
-- reinstalled. Asked once here, the server can answer it for itself.
--
-- Deliberately NULL by default: null means "follow the teacher's own spoken
-- language from onboarding", which is exactly today's behaviour. Nobody has to
-- touch this for anything to keep working.
alter table students
  add column if not exists spoken_language text;
