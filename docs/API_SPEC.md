# API_SPEC.md — PPDS Knowledge Mapper (Upload-to-Adaptive)

> Kontrak API termasuk group baru untuk upload & AI extraction.

---

## 1. Conventions

- Base: `/api`
- Content-Type: `application/json` (kecuali upload = multipart/form-data)
- Auth: Supabase session (server-validated)
- Success: `{ "success": true, "data": {...} }`
- Error: `{ "success": false, "error": { "code", "message", "details" } }`

### Error Codes

| Code | HTTP | Meaning |
|---|---:|---|
| `UNAUTHORIZED` | 401 | Belum login |
| `FORBIDDEN` | 403 | Tidak punya akses |
| `NOT_FOUND` | 404 | Resource tidak ada |
| `VALIDATION_ERROR` | 400 | Body invalid |
| `FILE_TOO_LARGE` | 400 | File melebihi batas |
| `UNSUPPORTED_FILE_TYPE` | 400 | Tipe file tidak didukung |
| `USAGE_LIMIT_EXCEEDED` | 402 | Kuota Free habis |
| `EXTRACTION_FAILED` | 422 | Extraction gagal |
| `QUESTION_NOT_SCOREABLE` | 400 | Soal tak layak scoring |
| `SUBSCRIPTION_REQUIRED` | 402 | Butuh PRO |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 2. Existing API Groups (Preserved)

```txt
Auth / Profile     /api/me, /api/profile, /api/onboarding/complete
Quiz               /api/quiz/sessions, /api/quiz/responses, ...
Dashboard          /api/dashboard/summary, ...
Subscription       /api/subscription/status
Payment            /api/payment/create, /api/payment/webhook
```

---

## 3. NEW: Uploads

### 3.1 Create Upload

```http
POST /api/uploads
Content-Type: multipart/form-data
```

**Auth:** required.

**Body:** `file` (pdf/jpg/png), optional `specialty`.

**Validation:**
- file type ∈ {pdf, jpg, jpeg, png}
- file size ≤ limit (lihat UPLOAD_EXTRACTION.md)
- cek usage limit (Free)

**Response:**

```json
{
  "success": true,
  "data": {
    "upload": {
      "id": "uuid",
      "file_path": "uploads/{user_id}/{upload_id}/soal.pdf",
      "file_type": "pdf",
      "original_filename": "soal-tryout.pdf",
      "file_size": 1048576,
      "status": "uploaded",
      "created_at": "2026-06-05T00:00:00Z"
    }
  }
}
```

**Errors:** `UNAUTHORIZED`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`, `USAGE_LIMIT_EXCEEDED`.

---

### 3.2 List Uploads

```http
GET /api/uploads
```

**Auth:** required. Returns only own uploads.

```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "id": "uuid",
        "original_filename": "soal-tryout.pdf",
        "file_type": "pdf",
        "status": "extracted",
        "created_at": "2026-06-05T00:00:00Z"
      }
    ]
  }
}
```

---

### 3.3 Get Upload Detail

```http
GET /api/uploads/:id
```

**Auth:** required. Ownership enforced.

```json
{
  "success": true,
  "data": {
    "upload": {
      "id": "uuid",
      "file_path": "uploads/.../soal.pdf",
      "file_type": "pdf",
      "status": "extracted",
      "extraction_job": { "id": "uuid", "status": "completed" },
      "extracted_count": 24
    }
  }
}
```

---

## 4. NEW: Extraction Jobs

### 4.1 Create Extraction Job

```http
POST /api/extraction-jobs
```

**Auth:** required.

**Body:**

```json
{ "upload_id": "uuid" }
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "upload_id": "uuid",
      "provider": "gemini",
      "status": "pending",
      "created_at": "2026-06-05T00:00:00Z"
    }
  }
}
```

**Errors:** `UNAUTHORIZED`, `NOT_FOUND`, `USAGE_LIMIT_EXCEEDED`.

---

### 4.2 Get Extraction Job

```http
GET /api/extraction-jobs/:id
```

**Auth:** required. Ownership enforced.

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "upload_id": "uuid",
      "provider": "gemini",
      "status": "completed",
      "started_at": "2026-06-05T00:00:10Z",
      "completed_at": "2026-06-05T00:00:40Z",
      "error_message": null,
      "extracted_count": 24
    }
  }
}
```

Status: `pending | running | completed | failed`.

---

## 5. NEW: Extracted Questions

### 5.1 List Extracted Questions

```http
GET /api/extracted-questions?upload_id=uuid
```

**Auth:** required. Ownership enforced.

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "upload_id": "uuid",
        "topic": "Radiobiologi",
        "stem": "...",
        "options": { "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." },
        "answer": "c",
        "extraction_confidence": 0.92,
        "answer_confidence": 0.61,
        "review_status": "pending_review"
      }
    ]
  }
}
```

---

### 5.2 Update Extracted Question

```http
PATCH /api/extracted-questions/:id
```

**Auth:** required. Ownership enforced.

**Body (partial):**

```json
{
  "stem": "edited stem",
  "options": { "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." },
  "answer": "c",
  "topic": "Radiobiologi",
  "review_status": "needs_fix"
}
```

**Response:** updated question.

---

### 5.3 Approve Extracted Question

```http
POST /api/extracted-questions/:id/approve
```

**Auth:** required. Ownership enforced.

**Validation:** harus punya stem, options, answer sebelum approve.

```json
{
  "success": true,
  "data": { "question": { "id": "uuid", "review_status": "approved" } }
}
```

**Errors:** `QUESTION_NOT_SCOREABLE` jika answer key kosong.

---

## 6. NEW: Start Quiz From Uploaded Bank

```http
POST /api/quiz/from-upload
```

**Auth:** required.

**Body:**

```json
{ "upload_id": "uuid", "mode": "adaptive" }
```

**Logic:** pool = extracted_questions approved milik user (answer != null, status active). Reuse IRT engine.

```json
{
  "success": true,
  "data": {
    "session": { "id": "uuid", "specialty": "uploaded", "mode": "adaptive" },
    "available_questions": 18
  }
}
```

**Errors:** `UNAUTHORIZED`, `NOT_FOUND`, `QUESTION_NOT_SCOREABLE` (jika pool kosong).

---

## 7. NEW: Usage Limits

```http
GET /api/usage/limits
```

**Auth:** required.

```json
{
  "success": true,
  "data": {
    "tier": "free",
    "period": "2026-06",
    "uploaded_files_count": 2,
    "extracted_questions_count": 18,
    "limits": {
      "max_extracted_questions": 20,
      "max_uploads": 5
    },
    "remaining": {
      "extracted_questions": 2,
      "uploads": 3
    }
  }
}
```

---

## 8. Access Matrix

| API | Guest | Free | Pro | Lifetime |
|---|:---:|:---:|:---:|:---:|
| Upload create | No | Yes (limit) | Yes | Yes |
| Extraction job | No | Yes (limit) | Yes | Yes |
| Extracted questions CRUD | No | Own | Own | Own |
| Quiz from upload | No | Yes (limit) | Yes | Yes |
| Usage limits | No | Own | Own | Own |
| Gap dashboard full | No | Preview | Yes | Yes |
| AI tutor | No | No | Yes | Yes |

---

## 9. Security Notes

- Upload divalidasi server-side (type, size, ownership).
- File path namespaced per user di Storage.
- Extraction dijalankan server-side; API keys tidak pernah ke client.
- Soal hanya scoreable jika approved + ada answer key.
- Usage limit + PRO divalidasi server/database.
- Raw AI output disimpan untuk audit, tidak diekspos mentah ke client lain.

---

## 10. Idempotency

- Extraction job: hindari double-run untuk upload yang sama.
- Payment webhook: idempotent (dari roadmap payment).
