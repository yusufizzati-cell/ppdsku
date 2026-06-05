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

## Sprint P5 — Custom Quiz History

- Added custom quiz history page at `/custom-results`.
- Added custom quiz result detail page at `/custom-results/[id]`.
- Linked saved reviewed-upload quiz results to their detail page after saving.
- Added sidebar navigation item for upload quiz history.
- Preserved invariant: custom upload quiz history is separate from adaptive IRT analytics.

## Sprint P6 — Rich Result Review + Mistake Book

- Added migration `005_custom_question_attempts.sql` for immutable custom quiz question snapshots.
- Updated custom quiz save API to store full question/option/answer snapshots per attempt.
- Upgraded `/custom-results/[id]` into rich per-question review with highlighted user answer vs answer key.
- Added `/mistakes` mistake book page for wrong custom-upload questions with topic filter.
- Added Mistake Book navigation entry.
- Preserved invariant: custom-upload mistakes/results remain separate from adaptive IRT abilities.

## Sprint P7 — Learning Insights

- Added `/learning-insights` dashboard page for custom-upload quiz analytics.
- Aggregates recent custom question attempts into topic-level accuracy, wrong counts, and subtopic weakness chips.
- Added next-focus recommendation that links directly into filtered Mistake Book review.
- Added Learning Insights navigation entry.
- Preserved invariant: custom-upload learning insights are derived from custom attempts only and do not update adaptive IRT abilities.

## Sprint P8 — AI Study Plan

- Added `/dashboard/study-plan` page that generates a 7-day study plan from custom-upload quiz attempts.
- Prioritizes topics by wrong-count, accuracy, and recent mistakes from `custom_question_attempts`.
- Added direct links from plan priorities to filtered Mistake Book and latest result review.
- Preserved invariant: study plan is generated from custom-upload practice data only and does not update adaptive IRT abilities.
