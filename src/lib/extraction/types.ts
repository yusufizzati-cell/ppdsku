/**
 * Sprint P2 — AI Extraction Pipeline Types
 */

export interface ExtractedQuestionRaw {
  question_number?: number;
  question_text: string;
  options: Record<string, string>; // { A: "...", B: "...", ... }
  answer_key?: string | null;       // null if not found
  explanation?: string | null;
  topic?: string | null;
  subtopic?: string | null;
  difficulty_estimate?: number | null; // 0-1 scale
  confidence: number;                 // 0-1 extraction confidence
  answer_confidence?: number;          // 0-1 answer key confidence
  source_page?: number | null;
  source_region?: string | null;
  raw_text?: string | null;
}

export interface ExtractionResult {
  success: boolean;
  questions: ExtractedQuestionRaw[];
  method: "gemini" | "ocr";
  error?: string;
  metadata?: {
    total_pages?: number;
    processing_time_ms?: number;
    model?: string;
  };
}

export interface ExtractionJobRow {
  id: string;
  upload_id: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  method: "gemini" | "ocr" | "manual";
  total_extracted: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedQuestionRow {
  id: string;
  job_id: string;
  user_id: string;
  question_number: number | null;
  question_text: string;
  options: Record<string, string>;
  answer_key: string | null;
  explanation: string | null;
  topic: string | null;
  subtopic: string | null;
  difficulty_estimate: number | null;
  confidence: number;
  answer_confidence: number | null;
  review_status: "pending" | "approved" | "rejected" | "edited";
  source_page: number | null;
  source_region: string | null;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}
