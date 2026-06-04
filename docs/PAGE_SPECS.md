# PAGE_SPECS.md — PPDS Knowledge Mapper (Upload-to-Adaptive)

> Spesifikasi halaman. Bagian baru: alur upload → review → quiz → result.

---

## 1. Existing Pages (Preserved)

```txt
/                     Landing (copywriting dipivot ke upload-to-adaptive)
/onkrad/quiz          Demo quiz Onkologi Radiasi (UNCHANGED, kecuali copy minor)
/onkrad/result        Demo result (UNCHANGED, kecuali copy minor)
/auth/login           Login
/auth/register        Register
/dashboard            Dashboard
/upgrade              Pricing
/payment/*            Payment flow
```

Demo Onkologi Radiasi tetap ada untuk user tanpa soal sendiri.

---

## 2. NEW: Upload Pages

### 2.1 `/upload`

**Purpose:** User upload file soal.

**Access:** logged-in (guest diarahkan login/registrasi; demo tetap tersedia tanpa upload).

**Structure:**

```txt
Header
Upload dropzone (drag-drop + klik)
File type & size hint
Usage limit banner (Free)
Recent uploads (link ke /uploads)
```

**Components:** `UploadCard`, `UsageLimitBanner`, `EmptyState`.

**States:** idle, uploading (progress), success, error (FILE_TOO_LARGE / UNSUPPORTED_FILE_TYPE / USAGE_LIMIT_EXCEEDED).

**CTA:** "Upload Soal" → buat upload → redirect `/uploads/[uploadId]`.

---

### 2.2 `/uploads`

**Purpose:** Daftar semua upload user.

**Structure:**

```txt
Header + "Upload Baru"
List upload (filename, type, status badge, tanggal, extracted_count)
Empty state (ajak upload / coba demo)
```

**Components:** `UploadListItem`, `StatusBadge`, `EmptyState`.

---

### 2.3 `/uploads/[uploadId]`

**Purpose:** Detail satu upload + status extraction.

**Structure:**

```txt
File info
Extraction status (ExtractionProgress)
CTA: Mulai Extraction / Lihat Review / Mulai Quiz (sesuai status)
```

**Components:** `ExtractionProgress`, `StatusBadge`.

**State-driven CTA:**

```txt
uploaded   → "Mulai Extraction"
extracting → progress (disabled)
extracted  → "Review Hasil" / "Mulai Quiz"
failed     → "Coba Lagi"
```

---

### 2.4 `/uploads/[uploadId]/review`

**Purpose:** Review & koreksi hasil extraction.

**Structure:**

```txt
Header + ringkasan (n soal, n perlu review)
List soal:
  - ReviewQuestionEditor (stem, options, answer, topic)
  - ConfidenceBadge (extraction + answer)
  - SourceQualityWarning (jika ada)
  - aksi: Approve / Reject / Tandai needs_fix
Footer: progress approve + CTA "Mulai Quiz" (aktif jika ada approved)
```

**Components:** `ReviewQuestionEditor`, `ConfidenceBadge`, `SourceQualityWarning`, `AIWarningState`.

**Rules:**
- Approve butuh stem + options + answer.
- Soal tanpa answer → tidak bisa approve untuk scoring.

---

### 2.5 `/uploads/[uploadId]/quiz`

**Purpose:** Adaptive quiz dari soal hasil upload (approved).

**Structure:** reuse quiz UI (QuizActive/QuizFeedback) dengan pool = extracted approved.

**Components:** existing quiz components.

**Rules:** IRT engine unchanged; pool dari extracted_questions approved.

---

### 2.6 `/uploads/[uploadId]/result`

**Purpose:** Result + gap mapping dari bank soal upload.

**Structure:**

```txt
Overall score
Radar / topic map dari bank upload
Gap analysis (Free: preview, Pro: full)
CTA: AI Tutor (Pro), Share Result, Upgrade
```

**Components:** reuse result + dashboard components.

---

## 3. Page Access Rules

| Page | Guest | Free | Pro |
|---|:---:|:---:|:---:|
| /upload | redirect | Yes (limit) | Yes |
| /uploads | redirect | Own | Own |
| /uploads/[id] | redirect | Own | Own |
| /uploads/[id]/review | redirect | Own | Own |
| /uploads/[id]/quiz | redirect | Yes (limit) | Yes |
| /uploads/[id]/result | redirect | Preview | Full |

---

## 4. Analytics Events (Draft)

```txt
upload_started
upload_completed
upload_failed
extraction_started
extraction_completed
extraction_failed
review_opened
question_edited
question_approved
question_rejected
quiz_from_upload_started
upload_result_viewed
usage_limit_hit
upgrade_clicked
```

---

## 5. Acceptance (per page)

Tiap halaman dianggap selesai jika: ada purpose jelas, CTA jelas, access rule benar, loading/empty/error state ada, mobile usable, tidak ekspos data user lain, dan (untuk quiz) IRT tidak berubah.
