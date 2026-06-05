-- Sprint P2 — AI Extraction Pipeline
-- Creates extraction_jobs + extracted_questions tables with RLS.
-- Run in Supabase SQL Editor.

-- ============================================================
-- 1. extraction_jobs table
-- ============================================================
CREATE TABLE IF NOT EXISTS extraction_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id       UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  method          TEXT NOT NULL DEFAULT 'gemini'
                    CHECK (method IN ('gemini', 'ocr', 'manual')),
  total_extracted INT DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE extraction_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own extraction jobs" ON extraction_jobs;
CREATE POLICY "Users can view own extraction jobs" ON extraction_jobs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own extraction jobs" ON extraction_jobs;
CREATE POLICY "Users can insert own extraction jobs" ON extraction_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Server (via service role) needs to update jobs — but user-scoped RLS
-- is enforced for reads. Updates go through API routes with service role.
DROP POLICY IF EXISTS "Users can update own extraction jobs" ON extraction_jobs;
CREATE POLICY "Users can update own extraction jobs" ON extraction_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_extraction_jobs_upload ON extraction_jobs(upload_id);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_user ON extraction_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_status ON extraction_jobs(user_id, status);

-- ============================================================
-- 2. extracted_questions table
-- ============================================================
CREATE TABLE IF NOT EXISTS extracted_questions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL REFERENCES extraction_jobs(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_number     INT,
  question_text       TEXT NOT NULL,
  options             JSONB NOT NULL DEFAULT '{}',
  answer_key          TEXT,          -- NULL if not found in source
  explanation         TEXT,
  topic               TEXT,
  subtopic            TEXT,
  difficulty_estimate DECIMAL,       -- AI-estimated, not IRT-calibrated
  confidence          DECIMAL NOT NULL DEFAULT 0.0
                        CHECK (confidence >= 0 AND confidence <= 1),
  answer_confidence   DECIMAL DEFAULT 0.0
                        CHECK (answer_confidence >= 0 AND answer_confidence <= 1),
  review_status       TEXT NOT NULL DEFAULT 'pending'
                        CHECK (review_status IN ('pending', 'approved', 'rejected', 'edited')),
  source_page         INT,
  source_region       TEXT,          -- e.g. "page 3, top-half"
  raw_text            TEXT,          -- raw OCR/extracted text before parsing
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE extracted_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own extracted questions" ON extracted_questions;
CREATE POLICY "Users can view own extracted questions" ON extracted_questions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own extracted questions" ON extracted_questions;
CREATE POLICY "Users can insert own extracted questions" ON extracted_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own extracted questions" ON extracted_questions;
CREATE POLICY "Users can update own extracted questions" ON extracted_questions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own extracted questions" ON extracted_questions;
CREATE POLICY "Users can delete own extracted questions" ON extracted_questions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_extracted_questions_job ON extracted_questions(job_id);
CREATE INDEX IF NOT EXISTS idx_extracted_questions_user ON extracted_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_questions_review ON extracted_questions(job_id, review_status);
