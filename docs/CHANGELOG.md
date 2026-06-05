# CHANGELOG

All notable changes to PPDS Knowledge Mapper.

Format: [Keep a Changelog](https://keepachangelog.com/). Versioning: SemVer.

---

## [Unreleased] — Product Pivot: Upload-to-Adaptive

### Added
- **Product pivot to upload-to-adaptive learning.** PPDS Knowledge Mapper is now an AI adaptive quiz builder: upload soal (PDF/foto) → AI extract → review → adaptive IRT quiz → gap mapping.
- Upload/extraction architecture docs:
  - `docs/UPLOAD_EXTRACTION.md` — upload & extraction flow, file rules, status, review, privacy, usage limits.
  - `docs/AI_EXTRACTION_SPEC.md` — Gemini Flash extraction, Tesseract OCR fallback, JSON output, confidence, answer-key uncertainty, medical disclaimer, failure handling.
- API spec for new groups in `docs/API_SPEC.md`: Uploads, Extraction Jobs, Extracted Questions, Review, Quiz From Upload, Usage Limits.
- Architecture for uploads/extraction in `docs/SYSTEM_MAP.md` (Supabase Storage, `uploads`, `extraction_jobs`, `extracted_questions`, `usage_counters`, confidence, review workflow, source quality warning).
- New page specs in `docs/PAGE_SPECS.md`: `/upload`, `/uploads`, `/uploads/[id]`, `/uploads/[id]/review`, `/uploads/[id]/quiz`, `/uploads/[id]/result`.
- New UI concepts in `docs/DESIGN_SYSTEM.md`: UploadCard, ExtractionProgress, ConfidenceBadge, ReviewQuestionEditor, AIWarningState, SourceQualityWarning, UsageLimitBanner.
- Pivoted roadmap in `docs/IMPLEMENTATION_PLAN.md`: Sprint P0–P9.
- Test plan in `docs/TESTING.md` for upload/extraction/review/isolation/usage limits.

### Changed
- Product positioning updated in `PROJECT_BRIEF.md`, `SYSTEM_MAP.md`, `PRD.md`, `README.md`: from internal bank soal → AI adaptive quiz builder.
- Static bank soal (`public/data/onkrad.json`) is **no longer the sole product center** — now a demo/onboarding path for users without their own questions.

### Unchanged (Invariants)
- Core IRT engine (`src/engine/*`) untouched.
- `public/data/onkrad.json` untouched.
- `/onkrad/quiz` and `/onkrad/result` still build and work.
- Existing auth, RLS, quiz persistence, subscription validation preserved.

### Notes
- Sprint P0 is **docs/architecture only**. No upload/extraction/payment/admin feature code in this change.
- Branch: `feat/pivot-upload-to-adaptive-docs`.

---

## [0.3.0] — Quiz Persistence (prior work)

### Added
- Logged-in quiz persistence: quiz_sessions, question_responses, topic_abilities.
- Dashboard backed by real user data.
- Subscription (PRO) server-side validation; result-page gating via DB (not CSS only).
- Payment scaffolding (pending/success/failed pages, subscription status API).

### Added (earlier)
- Landing, adaptive quiz (IRT 2PL), result page, auth (Supabase), dashboard shell, design system, full Onkologi Radiasi bank (790 soal) as demo.
