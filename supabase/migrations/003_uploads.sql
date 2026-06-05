-- Sprint P1 — Upload UI + File Storage
-- Creates the uploads table, RLS, and the Storage bucket + policies.
-- Run in Supabase SQL Editor.

-- ============================================================
-- 1. uploads table
-- ============================================================
CREATE TABLE IF NOT EXISTS uploads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path         TEXT NOT NULL,
  file_type         TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
  original_filename TEXT NOT NULL,
  file_size         INT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'uploaded'
                      CHECK (status IN ('uploaded', 'extracting', 'extracted', 'failed')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own uploads
DROP POLICY IF EXISTS "Users can view own uploads" ON uploads;
CREATE POLICY "Users can view own uploads" ON uploads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own uploads" ON uploads;
CREATE POLICY "Users can insert own uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own uploads" ON uploads;
CREATE POLICY "Users can update own uploads" ON uploads
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own uploads" ON uploads;
CREATE POLICY "Users can delete own uploads" ON uploads
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(user_id, status);

-- ============================================================
-- 2. Storage bucket: uploads (private)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Storage RLS policies
-- Path convention: uploads/{user_id}/{upload_id}/{filename}
-- The first folder segment must equal the user's UID.
-- ============================================================
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
