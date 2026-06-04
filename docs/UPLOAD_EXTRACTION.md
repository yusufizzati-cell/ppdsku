# UPLOAD_EXTRACTION.md — Upload & Extraction Flow

> Detail flow upload file dan extraction soal untuk PPDS Knowledge Mapper.

---

## 1. Tujuan

User mengupload soal tryout (PDF/foto), sistem meng-extract soal menjadi format terstruktur agar bisa direview dan dijadikan adaptive quiz.

```txt
Upload → Extraction → Review → Approve → Adaptive Quiz
```

---

## 2. File Upload

### 2.1 File Type yang Didukung

```txt
PDF   : application/pdf
Image : image/jpeg, image/jpg, image/png
```

Tidak didukung (P0/P1): docx, xlsx, zip, heic (pertimbangkan konversi nanti).

### 2.2 Max File Size

```txt
PDF   : 10 MB
Image : 5 MB per file
```

Batas ini bisa di-tune; enforce server-side. File melebihi → `FILE_TOO_LARGE`.

### 2.3 Storage Path

```txt
Bucket: uploads
Path  : uploads/{user_id}/{upload_id}/{original_filename}
```

- Namespaced per user.
- Storage policy: user hanya akses prefix miliknya.
- File tidak public; akses via signed URL bila perlu ditampilkan.

---

## 3. Status Flow

### 3.1 Upload Status

```txt
uploaded    file tersimpan di storage + row uploads dibuat
extracting  extraction job sedang berjalan
extracted   extraction selesai, ada extracted_questions
failed      extraction gagal
```

### 3.2 Extraction Job Status

```txt
pending     job dibuat, antri
running     extraction berjalan
completed   sukses, hasil tersimpan
failed      gagal (lihat error_message)
```

### 3.3 Extracted Question Review Status

```txt
pending_review  hasil AI, belum direview user
needs_fix       user menandai perlu perbaikan
approved        user setuju, layak masuk quiz pool
rejected        user buang soal ini
```

---

## 4. Review Flow

```txt
1. Extraction selesai → extracted_questions (pending_review)
2. User buka /uploads/[uploadId]/review
3. Tiap soal tampil dengan:
   - stem, options, answer (jika ada)
   - extraction_confidence badge
   - answer_confidence badge
   - source_quality_warning (jika file blur / OCR rendah)
4. User koreksi field yang salah (stem/options/answer/topic)
5. User approve atau reject tiap soal
6. Hanya approved + ada answer key yang masuk adaptive scoring
```

Prinsip: **AI extraction tidak pernah final tanpa review user.**

---

## 5. Security & Privacy Rules

- File milik user, diisolasi via RLS (`uploads`) + storage policy.
- User A tidak bisa baca file/soal user B.
- Validasi server-side: file type, size, ownership.
- Extraction berjalan server-side; API key AI tidak pernah ke client.
- Raw extraction output disimpan untuk audit, tidak diekspos antar user.
- Retensi: file boleh dihapus user kapan saja; pertimbangkan auto-purge file lama (kebijakan retensi terpisah).
- Tidak ada PII pihak ketiga yang sengaja dikumpulkan; konten soal milik user.

---

## 6. Usage Limit Free vs Pro

| Tier | Max uploads | Max extracted questions |
|---|---|---|
| Free | ~5 file | ~20 soal |
| Pro 3 Bulan | besar | besar |
| Pro 6 Bulan | besar | besar |
| Lifetime | penuh | penuh |

- Dihitung di `usage_counters` (per periode bulanan untuk Free).
- Enforce server-side sebelum upload & extraction job.
- Free melebihi batas → `USAGE_LIMIT_EXCEEDED` + banner upgrade.

---

## 7. Error Handling

| Kasus | Penanganan |
|---|---|
| File terlalu besar | Tolak sebelum upload, pesan jelas |
| Tipe tidak didukung | Tolak, sarankan PDF/JPG/PNG |
| Extraction gagal | status failed + error_message, tawarkan retry |
| Hasil low-confidence | Tandai + OCR fallback + minta review ekstra |
| File blur/tak terbaca | source_quality_warning, sarankan upload ulang |
| Kuota habis | USAGE_LIMIT_EXCEEDED + CTA upgrade |

---

## 8. UX Notes

- Drag-drop + klik untuk upload.
- Progress state saat extraction (pending → running → done).
- Confidence badge: hijau (tinggi), kuning (sedang), merah (rendah).
- Source quality warning ditampilkan jelas tapi tidak menyalahkan user.
- Empty state: ajak coba demo Onkologi Radiasi jika belum punya soal.

---

## 9. Disclaimer Konten Medis

```txt
Soal dan jawaban berasal dari file yang diupload user.
Akurasi konten adalah tanggung jawab user.
Sistem menyediakan extraction + review, bukan validasi medis.
Soal tanpa answer key terkonfirmasi tidak digunakan untuk scoring.
```
