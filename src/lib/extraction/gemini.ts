/**
 * Sprint P2 — Gemini Flash Extraction
 * Server-side only. Extracts MCQ questions from uploaded files.
 */

import { ExtractedQuestionRaw, ExtractionResult } from "./types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const EXTRACTION_PROMPT = `Kamu adalah AI extractor soal ujian kedokteran Indonesia.

TUGAS: Ekstrak SEMUA soal pilihan ganda dari dokumen yang diberikan.

OUTPUT FORMAT: JSON array. Setiap soal:
{
  "question_number": number | null,
  "question_text": "teks soal lengkap",
  "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "answer_key": "huruf jawaban (A/B/C/D/E)" | null,
  "explanation": "penjelasan jika ada" | null,
  "topic": "topik/bidang soal" | null,
  "subtopic": "sub-topik" | null,
  "difficulty_estimate": 0.0-1.0 | null,
  "confidence": 0.0-1.0,
  "answer_confidence": 0.0-1.0 | null,
  "source_page": number | null,
  "source_region": "deskripsi lokasi di halaman" | null
}

ATURAN:
1. Ekstrak SEMUA soal, jangan skip.
2. Pertahankan format asli soal (termasuk kasus klinis panjang).
3. Jika answer key TIDAK ada di sumber, set answer_key = null dan answer_confidence = 0.
4. Jika answer key ADA tapi kamu tidak yakin, set answer_confidence rendah (0.3-0.6).
5. confidence = keyakinan bahwa soal ter-ekstrak dengan benar (teks, opsi).
6. Untuk soal bergambar, deskripsikan gambar di question_text: "[Gambar: deskripsi]".
7. topic harus dalam bahasa Indonesia.
8. Output HANYA JSON array, tanpa markdown fence, tanpa penjelasan tambahan.`;

/**
 * Extract questions from file content using Gemini Flash.
 */
export async function extractWithGemini(
  fileContent: string | ArrayBuffer,
  mimeType: string,
  apiKey: string
): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    // Build request parts
    const parts: Array<Record<string, unknown>> = [
      { text: EXTRACTION_PROMPT },
    ];

    if (mimeType === "application/pdf" || mimeType.startsWith("image/")) {
      // Send as inline_data (base64)
      let base64Data: string;
      if (typeof fileContent === "string") {
        base64Data = fileContent;
      } else {
        base64Data = Buffer.from(fileContent).toString("base64");
      }
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    } else {
      // Plain text fallback
      const textContent =
        typeof fileContent === "string"
          ? fileContent
          : Buffer.from(fileContent).toString("utf-8");
      parts.push({ text: textContent });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

    // Extract text from response
    const rawText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      throw new Error("Gemini returned empty response");
    }

    // Parse JSON — handle possible markdown fences
    const cleanJson = rawText
      .replace(/^```json\n?/i, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    let questions: ExtractedQuestionRaw[];
    try {
      const parsed = JSON.parse(cleanJson);
      questions = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${cleanJson.slice(0, 200)}`);
    }

    // Validate and normalize each question
    questions = questions
      .filter((q) => q.question_text && typeof q.question_text === "string")
      .map((q, idx) => ({
        question_number: q.question_number ?? idx + 1,
        question_text: q.question_text.trim(),
        options: normalizeOptions(q.options),
        answer_key: normalizeAnswerKey(q.answer_key),
        explanation: q.explanation?.trim() || null,
        topic: q.topic?.trim() || null,
        subtopic: q.subtopic?.trim() || null,
        difficulty_estimate: clamp01(q.difficulty_estimate),
        confidence: clamp01(q.confidence) ?? 0.5,
        answer_confidence: clamp01(q.answer_confidence) ?? 0,
        source_page: q.source_page ?? null,
        source_region: q.source_region ?? null,
        raw_text: q.raw_text ?? null,
      }));

    return {
      success: true,
      questions,
      method: "gemini",
      metadata: {
        processing_time_ms: Date.now() - startTime,
        model: "gemini-2.0-flash",
      },
    };
  } catch (error) {
    return {
      success: false,
      questions: [],
      method: "gemini",
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        processing_time_ms: Date.now() - startTime,
        model: "gemini-2.0-flash",
      },
    };
  }
}

function normalizeOptions(
  opts: unknown
): Record<string, string> {
  if (!opts || typeof opts !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(opts as Record<string, unknown>)) {
    const k = key.toUpperCase().trim();
    if (/^[A-E]$/.test(k) && value) {
      result[k] = String(value).trim();
    }
  }
  return result;
}

function normalizeAnswerKey(key: unknown): string | null {
  if (!key || typeof key !== "string") return null;
  const k = key.toUpperCase().trim();
  return /^[A-E]$/.test(k) ? k : null;
}

function clamp01(val: unknown): number | null {
  if (val == null || typeof val !== "number") return null;
  return Math.max(0, Math.min(1, val));
}
