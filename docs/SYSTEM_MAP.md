# SYSTEM_MAP.md — PPDS Knowledge Mapper

> Peta sistem lengkap setelah pivot ke **upload-to-adaptive**: arsitektur, data model, alur, dan komponen.

---

## 1. Product Direction

```txt
AI adaptive quiz builder untuk calon PPDS.
Upload soal → AI extract → review → adaptive IRT quiz → gap mapping.
```

Engine adaptif + AI extraction = inti produk. Bank soal datang dari user.

---

## 2. High-Level Architecture

```txt
[ Browser / Next.js App ]
        │
        ├── Auth (Supabase Auth)
        │
        ├── Upload UI ───────────► Supabase Storage (uploaded files)
        │                                │
        │                                ▼
        ├── Extraction Job ──────► AI Extraction Pipeline
        │                          (Gemini Flash + OCR fallback)
        │                                │
        │                                ▼
        │                          extracted_questions (DB)
        │                                │
        ├── Review UI ◄──────────────────┘
        │     (confidence + user correction)
        │
        ├── Adaptive Quiz ──────► IRT Engine (src/engine, unchanged)
        │                                │
        │                                ▼
        │                  quiz_sessions / question_responses /
        │                  topic_abilities (DB)
        │
        └── Gap Dashboard ◄──────── topic_abilities + extracted bank
```

---

## 3. Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Frontend | Next.js 14 App Router | existing |
| Language | TypeScript | existing |
| Styling | Tailwind CSS | existing |
| Auth | Supabase Auth | existing |
| DB | Supabase PostgreSQL + RLS | existing |
| File storage | Supabase Storage | **new** |
| AI extraction | Gemini Flash | **new (P2)** |
| OCR fallback | Tesseract | **new (P2)** |
| Payment | Midtrans QRIS | planned |
| State | Zustand + Supabase | existing |
| Charts | Custom SVG radar | existing |
| Deploy | Vercel | existing |

---

## 4. Existing Components (Preserved)

```txt
src/engine/irt.ts          IRT 2PL — UNCHANGED
src/engine/selector.ts     adaptive selection — UNCHANGED
src/engine/scorer.ts       scoring — UNCHANGED
src/store/quiz-store.ts    quiz state
src/lib/supabase/*         auth + db clients
src/lib/subscription.ts    PRO validation (server-side)
src/lib/quiz-persistence.ts session persistence
src/lib/dashboard-data.ts  dashboard data service
public/data/onkrad.json    demo bank — UNCHANGED, now demo-only
```

---

## 5. New Architecture — Upload & Extraction

### 5.1 Components

```txt
Supabase Storage bucket: uploads/{user_id}/{upload_id}/{filename}
uploads table              metadata file yang diupload
extraction_jobs table      status job extraction AI
extracted_questions table  hasil extract, per soal
usage_counters table       kuota Free vs Pro
```

### 5.2 Extraction Workflow

```txt
1. User upload file → row di `uploads` (status: uploaded)
2. Buat `extraction_jobs` (status: pending)
3. Pipeline jalan: Gemini Flash extract → JSON
   - Jika gagal/low-confidence → OCR fallback (Tesseract)
4. Hasil disimpan ke `extracted_questions` (review_status: pending_review)
   - tiap soal punya extraction_confidence + answer_confidence
5. Job selesai (status: completed / failed)
6. User review di Review UI → koreksi → approve
7. Soal approved (review_status: approved) masuk adaptive quiz pool
```

### 5.3 Confidence & Quality

```txt
extraction_confidence  seberapa yakin AI atas hasil parsing soal
answer_confidence      seberapa yakin AI atas answer key
review_status          pending_review | approved | rejected | needs_fix
source_quality_warning ditampilkan jika file blur / low OCR quality
```

Aturan: soal hanya boleh masuk adaptive scoring jika `review_status = approved` dan punya answer key terkonfirmasi user.

---

## 6. Data Model

### 6.1 Existing Tables

```txt
profiles
subscriptions
quiz_sessions
question_responses
topic_abilities
payments
study_tasks
```

### 6.2 New Tables

#### uploads

```txt
id              uuid pk
user_id         uuid fk auth.users
file_path       text   (storage path)
file_type       text   (pdf | image)
original_filename text
file_size       int    (bytes)
status          text   (uploaded | extracting | extracted | failed)
created_at      timestamptz
updated_at      timestamptz
```

#### extraction_jobs

```txt
id              uuid pk
user_id         uuid fk
upload_id       uuid fk uploads
provider        text   (gemini | tesseract)
status          text   (pending | running | completed | failed)
raw_output      jsonb  (raw AI/OCR output)
error_message   text
started_at      timestamptz
completed_at    timestamptz
created_at      timestamptz
```

#### extracted_questions

```txt
id                    uuid pk
user_id               uuid fk
upload_id             uuid fk uploads
source_type           text   (pdf | image)
specialty             text
topic                 text
subtopic              text
stem                  text
options               jsonb  ({a,b,c,d,e})
answer                text   (nullable until confirmed)
explanation           text
difficulty            numeric
discrimination        numeric
extraction_confidence numeric (0-1)
answer_confidence     numeric (0-1)
review_status         text   (pending_review | approved | rejected | needs_fix)
status                text   (active | archived)
created_at            timestamptz
updated_at            timestamptz
```

#### usage_counters

```txt
id                        uuid pk
user_id                   uuid fk
period                    text   (e.g. '2026-06' or 'lifetime')
uploaded_files_count      int
extracted_questions_count int
created_at                timestamptz
updated_at                timestamptz
```

---

## 7. RLS Strategy (New Tables)

```txt
uploads              user can CRUD only own rows
extraction_jobs      user can read only own jobs
extracted_questions  user can CRUD only own questions
usage_counters       user can read only own counters; writes server-side
```

Storage policy: path prefix `uploads/{user_id}/...` — user hanya akses file miliknya.

---

## 8. Adaptive Quiz From Uploaded Bank

```txt
Input pool  = extracted_questions WHERE user_id = me
              AND review_status = approved
              AND answer IS NOT NULL
              AND status = active

Engine      = src/engine (IRT 2PL) — UNCHANGED
Output      = quiz_sessions + question_responses + topic_abilities
```

IRT engine tidak peduli sumber soal — internal demo atau hasil upload, format sama (`QuestionItem`). Ini yang membuat pivot tidak menyentuh core engine.

---

## 9. Usage Limits

```txt
Free  : maks ~20 extracted questions, upload terbatas
Pro   : kuota besar, full fitur
Lifetime: akses penuh permanen (100 slot pertama)
```

Enforcement server-side via `usage_counters` + subscription status.

---

## 10. Roadmap Pointer

Lihat `IMPLEMENTATION_PLAN.md` untuk Sprint P0–P9.

```txt
P0  Pivot Docs & Architecture   ← current
P1  Upload UI + File Storage
P2  AI Extraction Pipeline
P3  Review Extracted Questions
P4  Adaptive Quiz from Uploaded Questions
P5  Gap Dashboard from Uploaded Bank
P6  Payment + Usage Limits
P7  AI Tutor per Soal
P8  Share Result + Referral
P9  QA, Security, Polish, Growth
```

---

## 11. Invariants (Do Not Break)

```txt
- Core IRT engine untouched.
- public/data/onkrad.json untouched.
- /onkrad/quiz dan /onkrad/result tetap build.
- PRO access server/database validated.
- Soal tanpa answer key terkonfirmasi tidak masuk scoring.
- User data diisolasi via RLS + storage policy.
```
