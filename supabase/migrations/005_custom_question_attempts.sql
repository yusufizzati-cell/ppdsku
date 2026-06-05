-- Sprint P6 — Rich Custom Result Review + Mistake Book
-- Creates immutable per-attempt question snapshots for reviewed-upload quizzes.
-- Run in Supabase SQL Editor after Sprint P5 is merged.

CREATE TABLE IF NOT EXISTS custom_question_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_response_id UUID REFERENCES question_responses(id) ON DELETE SET NULL,
  extracted_question_id UUID REFERENCES extracted_questions(id) ON DELETE SET NULL,
  upload_id           UUID REFERENCES uploads(id) ON DELETE SET NULL,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_number     INT,
  question_text       TEXT NOT NULL,
  options             JSONB NOT NULL DEFAULT '{}',
  selected_answer     TEXT NOT NULL,
  correct_answer      TEXT NOT NULL,
  is_correct          BOOLEAN NOT NULL DEFAULT false,
  explanation         TEXT,
  topic               TEXT,
  subtopic            TEXT,
  source_page         INT,
  source_region       TEXT,
  extraction_confidence DECIMAL,
  answer_confidence   DECIMAL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_question_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own custom question attempts" ON custom_question_attempts;
CREATE POLICY "Users can view own custom question attempts" ON custom_question_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own custom question attempts" ON custom_question_attempts;
CREATE POLICY "Users can insert own custom question attempts" ON custom_question_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own custom question attempts" ON custom_question_attempts;
CREATE POLICY "Users can delete own custom question attempts" ON custom_question_attempts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_custom_attempts_session ON custom_question_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_custom_attempts_user_created ON custom_question_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_attempts_mistakes ON custom_question_attempts(user_id, is_correct, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_attempts_upload ON custom_question_attempts(upload_id);
CREATE INDEX IF NOT EXISTS idx_custom_attempts_topic ON custom_question_attempts(user_id, topic);
