# TESTING.md — PPDS Knowledge Mapper

> Test plan. Bagian baru: upload, extraction, review, isolation, usage limit.

---

## 1. Existing (Preserve)

```txt
- IRT engine: probability2PL, updateAbility, thetaToPercent
- Adaptive selector: weakest-topic bias, no repeat, scoreable-only
- Scorer: session result, mastery status
- Auth: register → profile trigger, login, logout
- RLS: user only sees own rows
- Subscription: active+future=PRO, expired=not PRO, pending=not PRO
- Quiz persistence: sessions/responses/topic_abilities
```

Status sekarang: diverifikasi via script di `scripts/` (test-auth, test-persistence, test-pro-gating) + build/typecheck.

---

## 2. NEW: Upload Validation

```txt
[ ] Tolak file > max size (PDF 10MB, image 5MB) → FILE_TOO_LARGE
[ ] Tolak tipe tak didukung (docx/zip/dst) → UNSUPPORTED_FILE_TYPE
[ ] Terima pdf/jpg/jpeg/png
[ ] file_path namespaced uploads/{user_id}/{upload_id}/...
[ ] row uploads dibuat dengan status uploaded
[ ] Free melebihi kuota upload → USAGE_LIMIT_EXCEEDED
```

---

## 3. NEW: File Security & Isolation

```txt
[ ] User A tidak bisa baca uploads milik user B (RLS)
[ ] User A tidak bisa baca file storage user B (storage policy)
[ ] Signed URL hanya untuk owner
[ ] API key extraction tidak pernah ter-expose ke client
[ ] Tidak ada secrets ter-commit
```

---

## 4. NEW: Extraction JSON Validation

```txt
[ ] Output sesuai schema (questions[], options a–e, answer|null)
[ ] answer = null jika sumber tak mencantumkan
[ ] extraction_confidence & answer_confidence ada (0–1)
[ ] source_quality.warning terisi saat OCR/low quality
[ ] Job gagal → status failed + error_message
[ ] 0 soal terdeteksi → completed dengan warning
[ ] AI tidak mengarang soal/jawaban
```

---

## 5. NEW: Extracted Question Review

```txt
[ ] List hanya soal milik user (per upload_id)
[ ] PATCH edit stem/options/answer/topic tersimpan
[ ] Approve butuh stem+options+answer
[ ] Approve tanpa answer → QUESTION_NOT_SCOREABLE
[ ] Reject mengeluarkan soal dari pool
[ ] review_status transitions benar
```

---

## 6. NEW: Answer Key Uncertainty

```txt
[ ] Soal answer=null tidak masuk quiz pool
[ ] Soal answer=null tidak masuk scoring
[ ] Hanya approved + answer ada yang scoreable
```

---

## 7. NEW: Adaptive Quiz From Upload

```txt
[ ] Pool = extracted approved milik user
[ ] IRT engine tidak berubah (regression test engine tetap lulus)
[ ] Hasil tersimpan ke quiz_sessions/question_responses/topic_abilities
[ ] Pool kosong → QUESTION_NOT_SCOREABLE / empty state
```

---

## 8. NEW: Usage Limit

```txt
[ ] Free dibatasi (uploads + extracted_questions)
[ ] Counter naik setiap upload/extract
[ ] Pro/Lifetime bypass limit
[ ] GET /api/usage/limits akurat (remaining benar)
[ ] Limit divalidasi server-side (tidak bisa di-bypass client)
```

---

## 9. NEW: User Data Isolation (cross-cutting)

```txt
[ ] uploads, extraction_jobs, extracted_questions, usage_counters
    semua RLS: user hanya akses milik sendiri
[ ] Tidak ada kebocoran data antar user di semua endpoint baru
```

---

## 10. Regression Guard (Invariants)

```txt
[ ] Core IRT untouched (src/engine diff = 0)
[ ] public/data/onkrad.json untouched
[ ] /onkrad/quiz tetap build & jalan
[ ] /onkrad/result tetap build & jalan
[ ] npm run build pass
[ ] npm run lint pass
```

---

## 11. Test Approach

- Unit: engine (sudah ada secara fungsional), parsing extraction JSON.
- Integration: API upload/extraction/review terhadap Supabase (pakai pola script di `scripts/`).
- Security: RLS & storage isolation dengan dua user berbeda.
- E2E (nanti): upload → extract → review → quiz → result.
