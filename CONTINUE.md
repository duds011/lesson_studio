Continue working on Lesson Studio with me.

APP: C:\Users\854se\Desktop\KOKU LABS\lesson studio app koku
     Branch claude/redesign — NEVER touch main; production runs this branch.
     Live at https://koku-library.app (Vercel team studiokoku).
EXTENSION: C:\Users\854se\Desktop\koku-recorder (separate folder, NOT in the repo).

WHAT THIS IS
A SaaS for freelance language teachers. A Chrome extension records an online
lesson as TWO audio tracks (mic = teacher, tab = student), uploads to Supabase
Storage, /api/ext/complete transcribes each with Whisper and GPT writes a
recap the teacher reviews and publishes into a branded student portal
(lessons, progress charts, vocabulary, flashcards, practice tests with
recordable speaking answers).

STATE (2026-08-11)
- Extension is PUBLIC on the Chrome Web Store, id hionjogigcgebcagcfdililamfiopheg,
  version 1.0.0. A packaged 1.0.1 sits at koku-recorder\store\koku-recorder-1.0.1.zip
  (upload progress bar + per-student language memory) — I still need to upload it
  in the dashboard. /recorder and onboarding already use the store link.
- Languages, three fields with different jobs: profiles.teaching_language (what
  the teacher teaches), profiles.speaking_language (what they explain in),
  students.language (what THAT student learns — recaps and tests follow THIS).
  Whisper always gets an explicit ISO hint = "spoken most in this lesson" from
  the extension (remembered per student). Never let it auto-detect.
- Recent features, all live: /admin (gated by env ADMIN_EMAILS=duds.olipt@gmail.com,
  404s for everyone else, cascade account deletion); guided sidebar tour
  (localStorage ls.tour.done, replayable from Settings); tests store attempts
  (test_attempts) and show colour-coded scores; tests can span multiple lessons
  (length scales) with an optional teacher "directions" prompt box; 10 exercises
  per recap, editable in review (ExerciseEditor); vocabulary flashcards in each
  lesson's Practice tab; students record speaking answers on tests
  (student_audio_submissions now has nullable lesson_id + test_id/prompt_index;
  teacher listens on the test page); payments is a students×months grid with
  drag-to-pan; lesson credits are spent by PUBLISHED lessons, not bookings;
  money renders as whole units ($0); recordings purge after 30 days (cron);
  privacy policy at /privacy.

ACCOUNTS (Supabase project pbxyilslgxuxoztixotw)
- Noa noanoayo46@gmail.com — the real teacher. Student: Duarte
  (wogaoliveira@gmail.com, learns French).
- Akio kentoakio@gmail.com — beta teacher, teaches English, speaks Japanese.
  Students Fukunishi + Eylul (both English). Her recap was rebuilt to English
  on 2026-08-11 and is waiting as a DRAFT in her Recaps to review.
- Admin: duds.olipt@gmail.com → https://koku-library.app/admin (no link in the
  UI on purpose).

DEPLOY (pre-authorised, don't ask): a background task shares this checkout, so
the working tree holds edits that are not mine. `npm run build` builds the
WORKING TREE but Vercel builds GIT. Before every deploy:
  git worktree add --detach <tmp> HEAD
  (PowerShell, not bash:) cmd /c mklink /J "<tmp>\node_modules" "<repo>\node_modules"
  copy .env.local in, then: node node_modules\next\dist\bin\next build
Then POST a target:production git deployment to the Vercel API with
VERCEL_TOKEN from .env.local — team team_e3Yv5eHMmgxh4CPWBx2sEwaA, project
prj_IjN5S38JE3KYCOKQpJOQ0jdP4zm7, repoId 1286545849. Stage files individually
(git add <file>), never `git add -A`. The vercel CLI has no login here.

VERIFYING UI ON THIS MACHINE — known traps:
- The in-app browser pane is usually hidden: requestAnimationFrame never fires,
  CSS transitions freeze at their start values, count-up numbers stick at 0.
  These look like bugs and are not. Measure style values directly, or render
  headless (screenshot to a SHORT path like C:\Users\854se\AppData\Local\Temp\x.png —
  long paths get "Acesso negado").
- Auth-gated pages: make a temp route app/<name>-tmp/page.tsx rendering the
  component with sample data (folders starting with _ are not routes), verify,
  delete before committing. Dev server: preview config koku-dev-3300.
- Python pathlib write_text TRUNCATES the file before failing on a bad
  character — a crashed patch script once left a 0-byte file. Prefer the Edit
  tool for source edits.

OPEN THREADS
1. Upload koku-recorder-1.0.1.zip to the Chrome dashboard (user does this).
2. Akio should review & send her rebuilt English draft.
3. First real multi-lesson test generation is unverified (plumbing tested,
   model obedience to the directions box not yet observed).
4. The store listing is "Publicado - público" — user chose to leave it public.
