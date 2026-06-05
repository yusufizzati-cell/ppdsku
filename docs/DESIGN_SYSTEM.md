# DESIGN_SYSTEM.md — PPDS Knowledge Mapper

> Arah visual: **light medical-edtech SaaS**. Dokumen ini menambahkan UI concepts baru untuk alur upload-to-adaptive. Token dasar (warna, spacing, radius, shadow) tetap seperti implementasi existing di `tailwind.config.ts`.

---

## 1. Visual Direction (Unchanged)

```txt
Light, clean, premium, kredibel, medical-edtech.
Core palette: white, soft gray, blue, indigo, navy.
Rounded cards, subtle shadow, CTA jelas.
```

Token sumber kebenaran: `tailwind.config.ts` (primary, indigo, navy, success, warning, danger; radius card/button/input; shadow card/soft/modal).

---

## 2. New UI Concepts (Upload-to-Adaptive)

### 2.1 UploadCard / Dropzone

- Area drag-drop besar, border dashed, ikon upload.
- Hint tipe & ukuran file.
- State: idle, dragover (highlight primary), uploading (progress bar), success, error.

```txt
rounded-2xl border-2 border-dashed border-navy-200
hover/dragover: border-primary-400 bg-primary-50
```

### 2.2 ExtractionProgress

- Stepper / progress: pending → running → completed/failed.
- Spinner saat running, ikon check saat completed, ikon alert saat failed.
- Estimasi singkat ("AI sedang membaca soal kamu...").

### 2.3 ConfidenceBadge

- Badge kecil menunjukkan confidence.

```txt
high   (≥0.85) success-50 / success-700  "Yakin"
medium (0.6–0.85) warning-50 / warning-700 "Cek"
low    (<0.6) danger-50 / danger-700  "Perlu Review"
```

- Selalu sertakan label teks (jangan andalkan warna saja — aksesibilitas).

### 2.4 ReviewQuestionEditor

- Card berisi field editable: stem (textarea), options A–E (input), answer (select), topic (input/select).
- Tampilkan confidence badge di header card.
- Aksi: Approve (primary), Reject (ghost danger), Tandai needs_fix (secondary).
- Approve disabled jika answer kosong → tooltip menjelaskan.

### 2.5 AIWarningState

- Banner info bahwa hasil AI perlu diverifikasi.

```txt
status.info style (primary-50 / primary-700)
copy: "Hasil AI bisa keliru. Periksa sebelum dipakai untuk latihan."
```

### 2.6 SourceQualityWarning

- Banner warning saat file blur / OCR rendah.

```txt
status.warning (warning-50 / warning-700)
copy: "Kualitas file rendah. Beberapa soal mungkin kurang akurat."
```

- Tidak menyalahkan user; beri saran upload ulang.

### 2.7 UsageLimitBanner

- Banner kuota Free.

```txt
copy: "Kamu sudah pakai 18/20 soal gratis. Upgrade untuk unlimited."
CTA: "Upgrade ke PRO"
style: indigo accent (premium), bukan danger.
```

---

## 3. Component Naming (Additions)

```txt
UploadCard
UploadDropzone
UploadListItem
ExtractionProgress
ConfidenceBadge
ReviewQuestionEditor
AIWarningState
SourceQualityWarning
UsageLimitBanner
```

Reuse existing: `Button`, `Card`, `Badge`, `EmptyState`, quiz & result components.

---

## 4. State Design

- Loading: skeleton untuk list upload & review.
- Empty: `/uploads` kosong → ajak upload atau coba demo.
- Error: pesan jelas + aksi (retry/upload ulang).
- Locked (Free): gap analysis penuh terkunci → CTA upgrade (bukan dark pattern).

---

## 5. Accessibility

- Confidence/warning pakai teks + ikon, bukan warna saja.
- Dropzone bisa diakses keyboard + input file fallback.
- Tap target ≥ 44px.
- Focus ring jelas (`focus:ring-2 focus:ring-primary-500`).

---

## 6. Rules

1. Ikuti light medical-edtech SaaS.
2. Confidence & warning harus jelas tapi tidak menakut-nakuti.
3. AI selalu diframe sebagai "perlu diverifikasi", bukan kebenaran absolut.
4. Usage limit pakai nada mengajak upgrade, bukan menghukum.
5. Reuse komponen; hindari styling one-off.
