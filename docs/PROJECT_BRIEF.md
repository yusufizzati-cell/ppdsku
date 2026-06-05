# PROJECT_BRIEF.md — PPDS Knowledge Mapper

> Ringkasan cepat untuk memahami arah produk **PPDS Knowledge Mapper** setelah pivot ke **upload-to-adaptive learning**.
>
> Baca dokumen ini lebih dulu sebelum `SYSTEM_MAP.md`, `PRD.md`, `UPLOAD_EXTRACTION.md`, dan `AI_EXTRACTION_SPEC.md`.

---

## 1. One-Liner

**PPDS Knowledge Mapper adalah AI adaptive quiz builder untuk calon PPDS.**

```txt
Upload soal tryout PDF/foto → AI extract soal → user review hasil extract
→ adaptive IRT quiz → tau gap kamu di mana.
```

---

## 2. Pivot Context

Produk lama: bank soal internal Onkologi Radiasi + adaptive quiz dari soal statik.

Produk baru: **user membawa soal mereka sendiri**. Sistem meng-extract soal dari file yang diupload, lalu menjadikannya bank soal personal untuk adaptive quiz dan gap mapping.

Pergeseran inti:

```txt
DARI: bank soal internal sebagai pusat produk
KE  : engine adaptive + AI extraction sebagai pusat produk,
      bank soal datang dari user.
```

Static bank soal Onkologi Radiasi tetap ada sebagai **demo/onboarding**, bukan lagi inti produk.

---

## 3. Target User

- Calon PPDS yang punya banyak soal tryout beredar (PDF, foto, screenshot).
- Belajar masih random, tidak tahu topik mana yang sudah dikuasai vs belum.
- Butuh cara cepat mengubah tumpukan soal menjadi latihan terarah.

Pain utama:

```txt
"Soal banyak, tapi belajarku acak dan aku nggak tau lemah di mana."
```

---

## 4. Core Value

Learning intelligence dari soal milik user sendiri:

1. Upload soal (PDF/foto) tanpa harus mengetik ulang.
2. AI extract soal otomatis menjadi format terstruktur.
3. User review & koreksi hasil extract (akurasi + answer key).
4. Adaptive IRT quiz dari bank soal hasil upload.
5. Gap mapping: tahu topik lemah dan prioritas belajar.

---

## 5. Core User Flow (Target)

```txt
Landing
  ↓
Upload soal (PDF/foto)
  ↓
AI Extraction (Gemini Flash, fallback OCR)
  ↓
Review hasil extract (confidence + koreksi user)
  ↓
Approve soal
  ↓
Adaptive Quiz dari bank soal hasil upload
  ↓
Gap Dashboard
  ↓
(Pro) AI Tutor per soal, share result, dst.
```

Catatan: trial demo Onkologi Radiasi tetap dipertahankan untuk user yang belum punya soal.

---

## 6. Model Bisnis

| Tier | Harga | Batas |
|---|---|---|
| Free | Rp 0 | Upload/extract terbatas (≈20 soal) |
| Pro 3 Bulan | Rp 99.000 | Upload/extract lebih besar, full fitur |
| Pro 6 Bulan | Rp 149.000 | Best value |
| Early Adopter Lifetime | Rp 299.000 | 100 slot pertama, akses seumur hidup |

Pembayaran: QRIS via Midtrans (tetap dari roadmap lama).

---

## 7. Yang Dipertahankan dari Produk Lama

- Next.js 14 + TypeScript + Tailwind.
- Supabase Auth + profiles + onboarding.
- RLS hardening.
- Tabel `quiz_sessions`, `question_responses`, `topic_abilities`.
- Core IRT 2PL engine (`src/engine/`) — **tidak diubah**.
- Design system + dashboard shell.
- Payment plan (QRIS Midtrans).
- Static demo `public/data/onkrad.json` — sebagai demo, bukan pusat.

---

## 8. Yang Baru / Perlu Dibangun

- Supabase Storage untuk file upload.
- Tabel `uploads`, `extraction_jobs`, `extracted_questions`, `usage_counters`.
- Pipeline AI extraction (Gemini Flash + OCR fallback).
- Review workflow hasil extraction (confidence + koreksi user).
- Adaptive quiz dari extracted question bank.
- Gap dashboard dari bank soal hasil upload.
- Usage limit Free vs Pro.

---

## 9. Prinsip Produk

1. Soal milik user adalah inti — kurangi friksi upload.
2. AI extraction tidak pernah final tanpa review user.
3. Soal tanpa answer key terkonfirmasi tidak masuk adaptive scoring.
4. Core IRT tidak diubah tanpa alasan teknis kuat.
5. PRO access selalu divalidasi server/database, bukan CSS.
6. Konten medis: ada disclaimer, user bertanggung jawab atas akurasi soal mereka.
7. Privasi: file upload milik user, diisolasi via RLS + storage policy.

---

## 10. Dokumen Terkait

```txt
PROJECT_BRIEF.md       ← dokumen ini
SYSTEM_MAP.md          arsitektur sistem + data model
PRD.md                 kebutuhan produk + scope
IMPLEMENTATION_PLAN.md roadmap pivot (Sprint P0–P9)
API_SPEC.md            kontrak API termasuk upload/extraction
UPLOAD_EXTRACTION.md   detail flow upload & extraction
AI_EXTRACTION_SPEC.md  spesifikasi teknis AI extraction
PAGE_SPECS.md          spesifikasi halaman
DESIGN_SYSTEM.md       design tokens & komponen
TESTING.md             test plan
CHANGELOG.md           catatan perubahan
```

---

## 11. Final Summary

```txt
PPDS Knowledge Mapper = AI adaptive quiz builder.
User upload soal mereka → AI extract → review → adaptive quiz → gap mapping.

Bukan lagi sekadar bank soal internal.
Engine adaptif + AI extraction adalah inti produk.
```
