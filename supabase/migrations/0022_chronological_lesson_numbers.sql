-- Lesson numbers follow the lesson DATE, not the order recaps happened to be
-- published. A recording that arrives late (or is reviewed late) used to grab
-- the next number, so an Aug 16 lesson could sit as "Lesson 4" behind an
-- Aug 19 "Lesson 3". Numbers are now recomputed chronologically for the whole
-- student whenever a lesson is inserted, moved, re-dated, or deleted — which
-- also closes the gap a deleted lesson used to leave.

DROP TRIGGER IF EXISTS before_lesson_insert ON lessons;
DROP FUNCTION IF EXISTS assign_lesson_number();

CREATE OR REPLACE FUNCTION renumber_student_lessons(sid UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE lessons l SET lesson_number = t.rn
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY lesson_date, created_at, id) AS rn
    FROM lessons WHERE student_id = sid
  ) t
  WHERE l.id = t.id AND l.lesson_number IS DISTINCT FROM t.rn;
END;
$$;

CREATE OR REPLACE FUNCTION lessons_renumber()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- The renumber UPDATE only touches lesson_number, so it cannot re-fire this
  -- trigger's UPDATE OF list; the depth guard covers INSERT/DELETE cascades.
  IF pg_trigger_depth() > 1 THEN RETURN NULL; END IF;
  IF TG_OP = 'DELETE' THEN
    PERFORM renumber_student_lessons(OLD.student_id);
  ELSE
    PERFORM renumber_student_lessons(NEW.student_id);
    -- A lesson moved to another student leaves a hole behind it too.
    IF TG_OP = 'UPDATE' AND NEW.student_id IS DISTINCT FROM OLD.student_id THEN
      PERFORM renumber_student_lessons(OLD.student_id);
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER after_lesson_change
  AFTER INSERT OR DELETE OR UPDATE OF lesson_date, student_id ON lessons
  FOR EACH ROW EXECUTE PROCEDURE lessons_renumber();

-- Repair everything already on the board.
UPDATE lessons l SET lesson_number = t.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY lesson_date, created_at, id) AS rn
  FROM lessons
) t
WHERE l.id = t.id AND l.lesson_number IS DISTINCT FROM t.rn;
