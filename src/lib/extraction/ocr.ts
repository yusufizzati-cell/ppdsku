/**
 * Sprint P2 — OCR / Text Fallback Extraction
 * Uses pdf-parse v2 (PDFParse class) for PDF text extraction.
 * Server-side only.
 */

import { ExtractedQuestionRaw, ExtractionResult } from "./types";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF buffer using pdf-parse v2.
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    return textResult.pages.map((p) => p.text).join("\n");
  } catch {
    return buffer.toString("utf-8");
  }
}

/**
 * Parse MCQ questions from raw text using regex patterns.
 */
function parseMcqFromText(text: string): ExtractedQuestionRaw[] {
  const questions: ExtractedQuestionRaw[] = [];

  const questionPattern =
    /(?:(?:^|\n)\s*(?:(?:Soal|No\.?|Nomor)?\s*)?)(\d{1,3})[.)\s]+([\s\S]*?)(?=(?:\n\s*(?:(?:Soal|No\.?|Nomor)?\s*)?\d{1,3}[.)\s])|$)/gi;

  const optionPattern =
    /(?:^|\n)\s*([A-E])[.)\s]+(.+?)(?=(?:\n\s*[A-E][.)\s])|$)/gi;

  const answerPattern =
    /(?:jawaban|kunci|answer|key)[:\s]*([A-E])/i;

  const matches = Array.from(text.matchAll(questionPattern));

  for (const match of matches) {
    const qNum = parseInt(match[1], 10);
    const rawBlock = match[2].trim();

    if (!rawBlock || rawBlock.length < 10) continue;

    const options: Record<string, string> = {};
    const optMatches = Array.from(rawBlock.matchAll(optionPattern));

    for (const opt of optMatches) {
      const letter = opt[1].toUpperCase();
      options[letter] = opt[2].trim();
    }

    let questionText = rawBlock;
    if (optMatches.length > 0 && optMatches[0].index !== undefined) {
      questionText = rawBlock.slice(0, optMatches[0].index).trim();
    }

    if (!questionText || Object.keys(options).length < 2) continue;

    const answerMatch = rawBlock.match(answerPattern);
    const answerKey = answerMatch ? answerMatch[1].toUpperCase() : null;

    questions.push({
      question_number: qNum,
      question_text: questionText,
      options,
      answer_key: answerKey,
      explanation: null,
      topic: null,
      subtopic: null,
      difficulty_estimate: null,
      confidence: 0.4,
      answer_confidence: answerKey ? 0.5 : 0,
      source_page: null,
      source_region: null,
      raw_text: rawBlock.slice(0, 500),
    });
  }

  return questions;
}

/**
 * Extract questions using OCR/text fallback method.
 */
export async function extractWithOcr(
  fileContent: ArrayBuffer,
  mimeType: string
): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    const buffer = Buffer.from(fileContent);
    let text = "";

    if (mimeType === "application/pdf") {
      text = await extractTextFromPdf(buffer);
    } else {
      return {
        success: false,
        questions: [],
        method: "ocr",
        error: "OCR untuk gambar belum tersedia. Gunakan PDF untuk hasil terbaik.",
        metadata: { processing_time_ms: Date.now() - startTime },
      };
    }

    if (!text || text.trim().length < 50) {
      return {
        success: false,
        questions: [],
        method: "ocr",
        error: "Tidak dapat mengekstrak teks dari file. File mungkin berisi gambar tanpa teks.",
        metadata: { processing_time_ms: Date.now() - startTime },
      };
    }

    const questions = parseMcqFromText(text);

    if (questions.length === 0) {
      return {
        success: false,
        questions: [],
        method: "ocr",
        error: "Tidak ditemukan soal pilihan ganda dalam teks yang diekstrak.",
        metadata: { processing_time_ms: Date.now() - startTime },
      };
    }

    return {
      success: true,
      questions,
      method: "ocr",
      metadata: {
        processing_time_ms: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      questions: [],
      method: "ocr",
      error: error instanceof Error ? error.message : String(error),
      metadata: { processing_time_ms: Date.now() - startTime },
    };
  }
}
