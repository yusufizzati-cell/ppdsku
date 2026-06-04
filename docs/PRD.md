# PRD.md — PPDS Knowledge Mapper (Upload-to-Adaptive)

> Product Requirements Document setelah pivot ke AI adaptive quiz builder.

---

## 1. Overview

**Product:** PPDS Knowledge Mapper
**Model:** Freemium SaaS + Early Adopter Lifetime
**One-liner:** Upload soal tryout PDF/foto → AI extract → review → adaptive IRT quiz → tau gap kamu di mana.
**Target user:** Calon PPDS yang punya banyak soal beredar tapi belajar masih random.
**Deploy:** Vercel + Supabase (Auth, DB, Storage) + Gemini (extraction) + Midtrans (payment).

---

## 2. Problem

Calon PPDS punya tumpukan soal tryout (PDF, foto, screenshot) tapi:

- Belajar acak, tidak tahu topik lemah.
- Harus ketik ulang soal kalau mau latihan terstruktur.
- Tidak ada feedback adaptif atas penguasaan per topik.

---

## 3. Solution

```txt
Upload soal → AI extract otomatis → review hasil → adaptive quiz → gap mapping.
```

User tidak perlu mengetik ulang. AI mengubah file menjadi bank soal personal yang langsung bisa dilatih secara adaptif.

---

## 4. User Journey

```txt
Landing
  ↓
Upload soal (PDF/foto)   ── atau ──  Coba demo Onkologi Radiasi (tanpa upload)
  ↓
AI Extraction (progress state)
  ↓
Review hasil extract (confidence + koreksi answer key)
  ↓
Approve soal
  ↓
Adaptive Quiz dari bank hasil upload
  ↓
Result + Gap Dashboard
  ↓
(Pro) AI Tutor, share result, referral
```

---

## 5. Free vs Pro

| Feature | Free | Pro | Lifetime |
|---|---|---|---|
| Upload & extract | ✅ terbatas (~20 soal) | ✅ besar | ✅ penuh |
| Review hasil extract | ✅ | ✅ | ✅ |
| Adaptive quiz | ✅ (soal terbatas) | ✅ unlimited | ✅ |
| Gap dashboard | 🔒 preview | ✅ full | ✅ |
| AI Tutor per soal | ❌ | ✅ | ✅ |
| Share result + referral | ✅ basic | ✅ | ✅ |
| Progress tracking | 🔒 | ✅ | ✅ |

---

## 6. Pricing

| Tier | Harga |
|---|---|
| Free | Rp 0 |
| Pro 3 Bulan | Rp 99.000 |
| Pro 6 Bulan | Rp 149.000 |
| Early Adopter Lifetime | Rp 299.000 (100 slot pertama) |

Payment: QRIS via Midtrans. PRO access divalidasi server/database.

---

## 7. MVP Scope (Upload-to-Adaptive)

**Include (target P1–P6):**
- Upload PDF/foto ke Supabase Storage.
- AI extraction (Gemini Flash + OCR fallback).
- Review & koreksi hasil extract.
- Adaptive quiz dari soal approved.
- Gap dashboard dari bank hasil upload.
- Usage limit Free vs Pro + payment.

**Defer (P7+):**
- AI Tutor per soal.
- Share result + referral.
- Advanced analytics.
- Multi-format import lanjutan.

---

## 8. Core Rules

1. AI extraction tidak final tanpa review user.
2. Soal tanpa answer key terkonfirmasi tidak masuk adaptive scoring.
3. Core IRT engine tidak diubah.
4. PRO access server/database validated.
5. File upload diisolasi per user (RLS + storage policy).
6. Disclaimer konten medis: akurasi soal tanggung jawab user.
7. Demo Onkologi Radiasi tetap tersedia untuk user tanpa soal.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Upload completion rate | >70% file berhasil di-extract |
| Extraction accuracy (post-review) | user koreksi <30% field |
| Trial → Pro conversion | >5% |
| Lifetime slots terisi | 100/100 |
| Retention Pro | >60% renew |

---

## 10. Risks

| Risk | Mitigasi |
|---|---|
| Extraction tidak akurat | Review wajib + confidence score + OCR fallback |
| File berkualitas rendah | Source quality warning + guidance upload |
| Biaya AI API tinggi | Usage limit + batching + caching |
| Konten medis salah | Disclaimer + user ownership + no auto-scoring tanpa approve |
| Privasi file user | RLS + storage policy + retensi terbatas |

---

## 11. Out of Scope (For Now)

- Bank soal internal sebagai produk utama (sekarang demo saja).
- Kolaborasi multi-user atas satu bank soal.
- Marketplace soal antar user.
