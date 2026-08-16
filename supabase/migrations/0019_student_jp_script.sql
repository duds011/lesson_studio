-- How this student reads Japanese, for the RECAP.
--
-- The test generator already asks per test ('beginner' = kana + romaji
-- everywhere, 'hiragana' = kana only, 'kanji' = kanji with readings). The
-- recap had no equivalent, so a beginner got example sentences and Pattern
-- lines in bare kanji they could not read while the vocab bullets above them
-- carried romaji.
--
-- NULL means 'hiragana', which is exactly what every recap generated so far
-- assumed — so existing students are unaffected until a teacher says otherwise.
alter table students add column if not exists jp_script text
  check (jp_script is null or jp_script in ('beginner', 'hiragana', 'kanji'));
