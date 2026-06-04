# IMPLEMENTATION_PLAN.md — PPDS Knowledge Mapper (Pivot Roadmap)

> Roadmap pivot dari bank soal internal → **upload-to-adaptive learning**.

---

## 0. Principles

```txt
- Pivot in-place, bukan repo baru.
- Core IRT engine tidak diubah.
- public/data/onkrad.json tetap utuh (demo).
- /onkrad/quiz dan /onkrad/result tetap berfungsi.
- AI extraction tidak final tanpa review user.
- PRO access server/database validated.
- Bangun dalam layer aman, satu sprint satu fokus.
```

---

## 1. Roadmap Overview

```txt
Sprint P0 — Pivot Docs & Architecture          ← CURRENT
Sprint P1 — Upload UI + File Storage
Sprint P2 — AI Extraction Pipeline
Sprint P3 — Review Extracted Questions
Sprint P4 — Adaptive Quiz from Uploaded Questions
Sprint P5 — Gap Dashboard from Uploaded Bank
Sprint P6 — Payment + Usage Limits
Sprint P7 — AI Tutor per Soal
Sprint P8 — Share Result + Referral
Sprint P9 — QA, Security, Polish, Growth
```

---

## 2. Sprint P0 — Pivot Docs & Architecture

**Goal:** Seluruh docs, arsitektur, roadmap, API spec, dan product direction siap untuk upload-to-adaptive.

**Tasks:**
- Update positioning: PROJECT_BRIEF, SYSTEM_MAP, PRD, README.
- Pivot roadmap di IMPLEMENTATION_PLAN.
- Tambah API group upload/extraction di API_SPEC.
- Tambah arsitektur upload/extraction di SYSTEM_MAP.
- Buat UPLOAD_EXTRACTION.md + AI_EXTRACTION_SPEC.md.
- Tambah halaman upload/review/quiz di PAGE_SPECS.
- Tambah UI concepts di DESIGN_SYSTEM.
- Update CHANGELOG + TESTING.

**Do NOT:** coding fitur upload, AI extraction, payment, admin CRUD. Tidak ubah IRT/quiz/onkrad.json.

**Acceptance:** docs konsisten, build pass, lint pass, no destructive change.

---

## 3. Sprint P1 — Upload UI + File Storage

**Goal:** User bisa upload PDF/foto ke Supabase Storage.

**Tasks:**
- Buat Supabase Storage bucket + policy (`uploads/{user_id}/...`).
- Tabel `uploads` + RLS.
- Halaman `/upload` (drag-drop, file validation).
- Halaman `/uploads` (list) + `/uploads/[uploadId]` (detail).
- API: `POST /api/uploads`, `GET /api/uploads`, `GET /api/uploads/:id`.
- Validasi: file type (pdf/jpg/png), max size, error states.

**Acceptance:** user upload file → tersimpan di storage + row uploads, isolasi RLS terverifikasi.

---

## 4. Sprint P2 — AI Extraction Pipeline

**Goal:** File upload diubah jadi extracted_questions.

**Tasks:**
- Tabel `extraction_jobs` + `extracted_questions` + RLS.
- Integrasi Gemini Flash extraction (server-side).
- OCR fallback (Tesseract) untuk file low-confidence.
- API: `POST /api/extraction-jobs`, `GET /api/extraction-jobs/:id`.
- Simpan confidence (extraction + answer).
- Extraction failure handling.

**Acceptance:** upload → job → extracted_questions dengan confidence, gagal ditangani gracefully.

---

## 5. Sprint P3 — Review Extracted Questions

**Goal:** User review & koreksi hasil extract sebelum dipakai.

**Tasks:**
- Halaman `/uploads/[uploadId]/review`.
- Question editor (edit stem, options, answer, topic).
- Confidence badge + source quality warning.
- API: `GET /api/extracted-questions?upload_id=`, `PATCH /api/extracted-questions/:id`, `POST /api/extracted-questions/:id/approve`.
- Aturan: hanya approved + ada answer key yang masuk scoring.

**Acceptance:** user bisa koreksi & approve, soal tanpa answer key tidak masuk pool scoring.

---

## 6. Sprint P4 — Adaptive Quiz from Uploaded Questions

**Goal:** Adaptive IRT quiz dari bank soal hasil upload.

**Tasks:**
- API: `POST /api/quiz/from-upload`.
- Quiz pool = extracted_questions approved milik user.
- Reuse IRT engine (unchanged) + quiz UI.
- Halaman `/uploads/[uploadId]/quiz`.
- Persist ke quiz_sessions / question_responses / topic_abilities.

**Acceptance:** quiz adaptif jalan dari soal upload, IRT tidak berubah, hasil tersimpan.

---

## 7. Sprint P5 — Gap Dashboard from Uploaded Bank

**Goal:** Gap mapping dari bank soal hasil upload.

**Tasks:**
- Halaman `/uploads/[uploadId]/result`.
- Dashboard: readiness, topik prioritas, gap analysis dari bank upload.
- Reuse dashboard-data service + topic_abilities.

**Acceptance:** user tahu topik lemah dari soal mereka sendiri.

---

## 8. Sprint P6 — Payment + Usage Limits

**Goal:** Monetisasi + enforcement kuota.

**Tasks:**
- Tabel `usage_counters` + enforcement server-side.
- API: `GET /api/usage/limits`.
- Midtrans QRIS create + webhook (lanjut dari Fase 1 payment).
- Tier: Free / Pro 3bln / Pro 6bln / Lifetime (100 slot).
- Usage limit banner UI.

**Acceptance:** Free dibatasi, Pro/Lifetime unlock, payment webhook aktivasi PRO.

---

## 9. Sprint P7 — AI Tutor per Soal

**Goal:** Penjelasan AI per soal (Pro).

**Tasks:**
- AI tutor endpoint (penjelasan + reasoning per soal).
- UI tutor di review/quiz/result.
- Gating Pro.

---

## 10. Sprint P8 — Share Result + Referral

**Goal:** Growth loop.

**Tasks:**
- Share result (gap snapshot) ke sosial.
- Referral code + reward.

---

## 11. Sprint P9 — QA, Security, Polish, Growth

**Tasks:**
- Test upload/extraction/review/quiz/payment.
- Security: file validation, RLS, storage policy, rate limit.
- Polish mobile + empty/error states.
- Deployment hardening.

---

## 12. Dependency Map

```txt
P0 docs
  └─ P1 upload/storage
       └─ P2 extraction
            └─ P3 review
                 └─ P4 quiz from upload
                      └─ P5 gap dashboard
P6 payment/usage  (butuh auth+subscription, paralel setelah P1)
P7 AI tutor       (butuh P3/P4)
P8 share/referral (butuh P5)
P9 QA             (butuh semua core)
```

---

## 13. Invariants

```txt
- Core IRT untouched.
- public/data/onkrad.json untouched.
- /onkrad/quiz + /onkrad/result tetap build.
- PRO access server/database validated.
- AI extraction selalu di-review user sebelum scoring.
- User data diisolasi (RLS + storage policy).
```
