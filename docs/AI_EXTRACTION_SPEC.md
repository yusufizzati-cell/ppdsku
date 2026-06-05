# AI_EXTRACTION_SPEC.md — AI Extraction Specification

> Spesifikasi teknis pipeline AI extraction soal dari file upload.

---

## 1. Tujuan

Mengubah file soal (PDF/foto) menjadi `extracted_questions` terstruktur dengan confidence score, siap direview user.

---

## 2. Pipeline Overview

```txt
File (PDF/image)
   │
   ▼
[Primary] Gemini Flash extraction (multimodal)
   │  ├── sukses & confidence cukup → JSON questions
   │  └── gagal / low confidence
   ▼
[Fallback] Tesseract OCR → text
   │
   ▼
Post-process: parsing text → JSON questions
   │
   ▼
extracted_questions (pending_review) + confidence
```

---

## 3. Primary: Gemini Flash

- Model: Gemini Flash (multimodal, hemat biaya, cepat).
- Input: file PDF/gambar + prompt instruksi extraction.
- Output: JSON array soal (lihat schema §5).
- Alasan: bisa membaca layout soal + opsi langsung dari gambar/PDF tanpa OCR terpisah.

### 3.1 Prompt Direction (high-level)

```txt
- Ekstrak setiap soal: stem, opsi A–E, jawaban (jika tertera).
- Jangan mengarang jawaban jika tidak ada di sumber → answer = null.
- Infer topic/subtopic jika memungkinkan (boleh kosong).
- Sertakan confidence per soal.
- Jangan menambah soal yang tidak ada di sumber.
```

---

## 4. Fallback: Tesseract OCR

Dipakai jika:

```txt
- Gemini gagal (error/timeout), atau
- Confidence Gemini di bawah threshold, atau
- File berupa scan/foto berkualitas rendah.
```

Flow:

```txt
Tesseract OCR → raw text → heuristik parsing (regex/pattern) → JSON questions
```

OCR fallback umumnya menghasilkan confidence lebih rendah → review user lebih penting.

---

## 5. Expected JSON Output

```json
{
  "questions": [
    {
      "stem": "Protein yang berperan dalam NHEJ adalah ...",
      "options": {
        "a": "ATM",
        "b": "BRCA1",
        "c": "Ku70/80",
        "d": "Rad51",
        "e": "p53"
      },
      "answer": "c",
      "topic": "Radiobiologi",
      "subtopic": "DNA Repair",
      "explanation": null,
      "extraction_confidence": 0.92,
      "answer_confidence": 0.61
    }
  ],
  "source_quality": {
    "ocr_used": false,
    "warning": null
  }
}
```

Mapping ke tabel `extracted_questions`: lihat SYSTEM_MAP §6.2.

---

## 6. Confidence Score

| Field | Arti |
|---|---|
| `extraction_confidence` | Keyakinan parsing stem + options benar (0–1) |
| `answer_confidence` | Keyakinan answer key benar (0–1) |

Threshold acuan (tunable):

```txt
≥ 0.85  hijau  (high)
0.6–0.85 kuning (sedang, sarankan cek)
< 0.6   merah  (rendah, wajib review)
```

---

## 7. Answer Key Uncertainty

- Jika sumber tidak mencantumkan jawaban → `answer = null`, `answer_confidence = 0`.
- Soal dengan `answer = null` **tidak boleh** masuk adaptive scoring sampai user mengisi & approve.
- AI dilarang menebak jawaban tanpa dasar di sumber.

---

## 8. Topic Inference

- AI boleh menebak `topic`/`subtopic` dari konten soal.
- Hasil inference ditandai sebagai saran; user bisa override saat review.
- Jika tidak yakin → kosongkan, jangan paksa.

---

## 9. Medical Content Disclaimer

```txt
Pipeline ini melakukan extraction, bukan validasi medis.
Kebenaran soal & jawaban adalah tanggung jawab user.
Sistem tidak menjamin akurasi klinis konten hasil extraction.
```

Disclaimer ditampilkan di UI review.

---

## 10. User Review Before Scoring

```txt
extracted (pending_review)
   → user koreksi
   → user approve (wajib ada answer key)
   → baru masuk quiz pool / scoring
```

Tidak ada jalur yang melewati review untuk masuk scoring.

---

## 11. Extraction Failure Handling

| Kondisi | Aksi |
|---|---|
| Gemini error/timeout | Coba OCR fallback; jika tetap gagal → job failed + error_message |
| OCR gagal | job failed, sarankan upload ulang / file lebih jelas |
| 0 soal terdeteksi | job completed dengan 0 hasil + warning |
| Partial (sebagian soal) | simpan yang berhasil, tandai sisanya low-confidence |

Job yang failed boleh di-retry user (idempotent terhadap upload).

---

## 12. Cost & Performance Notes

- Gemini Flash dipilih untuk biaya rendah + kecepatan.
- Batasi ukuran/halaman per job (lihat usage limits).
- Pertimbangkan batching halaman PDF.
- Cache hasil per upload untuk hindari re-extract tanpa perlu.
- Usage limit melindungi dari abuse biaya API.

---

## 13. Security

- API key Gemini hanya di server (env var), tidak pernah ke client.
- Raw output disimpan di `extraction_jobs.raw_output` untuk audit.
- File diakses extraction worker via server-side service, bukan client.
- Tidak mengirim data user ke endpoint pihak ketiga selain provider extraction yang disepakati.
