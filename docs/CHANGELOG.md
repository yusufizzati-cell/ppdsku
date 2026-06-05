# Changelog

## Sprint P2 — AI Extraction Pipeline

- Added `extraction_jobs` and `extracted_questions` schema migration with RLS.
- Added server-side Gemini Flash extraction pipeline.
- Added PDF text/OCR fallback via `pdf-parse` with regex MCQ parsing.
- Added `POST /api/extraction-jobs` and `GET /api/extraction-jobs/:id`.
- Added extraction schema verification script.
- Upload status now transitions through extracting/extracted/failed during extraction.

Notes:
- Review UI is intentionally deferred to Sprint P3.
- Extracted questions remain `review_status = pending` and must not enter adaptive scoring until reviewed.

## Sprint P3 — Review UI

- Added extraction trigger from upload detail page.
- Added review page at `/uploads/[id]/review`.
- Added editable extracted-question cards with confidence/status badges.
- Added approve/reject actions for extracted questions.
- Added API routes for question edit, approve, and reject.
- Preserved invariant: AI extraction is not final until user review.

## Sprint P4 — Custom Quiz Pool from Reviewed Uploads

- Added reviewed-upload quiz page at `/uploads/[id]/quiz`.
- Added custom quiz client for approved extracted questions with answer keys.
- Added `POST /api/custom-quiz-sessions` to persist custom practice sessions.
- Linked review page to start quiz from approved questions.
- Preserved IRT invariant: custom reviewed-upload quiz does not update adaptive topic abilities.
