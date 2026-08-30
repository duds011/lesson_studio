-- What kind of word each vocabulary entry is. Nothing in the data said this
-- before, and deriving it from the word plus its definition got roughly half
-- of it wrong — calling `itinéraire` a verb and `initiative` an adjective. The
-- recap model is already writing the definition and the example sentence for
-- that word in that lesson, so it is the thing that should say.
-- Nullable on purpose: rows written before this exists stay untagged and fall
-- into the "everything" deck rather than a wrong one.
ALTER TABLE vocabulary_items ADD COLUMN IF NOT EXISTS part_of_speech TEXT;

-- A closed set, so the decks cannot multiply on a model's whim.
ALTER TABLE vocabulary_items DROP CONSTRAINT IF EXISTS vocabulary_items_pos_check;
ALTER TABLE vocabulary_items ADD CONSTRAINT vocabulary_items_pos_check
  CHECK (part_of_speech IS NULL OR part_of_speech IN
    ('noun','verb','adjective','adverb','phrase','other'));

CREATE INDEX IF NOT EXISTS idx_vocab_pos ON vocabulary_items(part_of_speech) WHERE is_key;

-- Flashcard progress. Leitner-lite: a card that is known moves up a box and
-- comes back later, a card that is missed drops to box 0 and comes back today.
-- One row per student per card, written only when a card is actually answered,
-- so an untouched deck costs nothing.
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  vocabulary_item_id UUID NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  box SMALLINT NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, vocabulary_item_id)
);

CREATE INDEX IF NOT EXISTS idx_fcr_student_due ON flashcard_reviews(student_id, due_at);

ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fcr_student" ON flashcard_reviews;
CREATE POLICY "fcr_student" ON flashcard_reviews FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

-- The teacher who owns the student can see how practice is going, not change it.
DROP POLICY IF EXISTS "fcr_teacher" ON flashcard_reviews;
CREATE POLICY "fcr_teacher" ON flashcard_reviews FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid()));
