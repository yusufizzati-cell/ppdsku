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
