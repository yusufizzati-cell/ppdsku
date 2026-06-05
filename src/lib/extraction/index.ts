/**
 * Sprint P2 — Extraction Pipeline Orchestrator
 * Tries Gemini Flash first, falls back to OCR/text parsing.
 * Server-side only.
 */

export { extractWithGemini } from "./gemini";
export { extractWithOcr } from "./ocr";
export type {
  ExtractionResult,
  ExtractedQuestionRaw,
  ExtractionJobRow,
  ExtractedQuestionRow,
} from "./types";
