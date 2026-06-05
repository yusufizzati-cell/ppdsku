"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface ReviewedQuizQuestion {
  id: string;
  question_number?: number | null;
  question_text: string;
  options: Record<string, string>;
  answer_key: string;
  explanation: string | null;
  topic: string | null;
  subtopic: string | null;
  source_page?: number | null;
  source_region?: string | null;
  confidence?: number | null;
  answer_confidence?: number | null;
}

interface ReviewedQuizClientProps {
  uploadId: string;
  questions: ReviewedQuizQuestion[];
}

interface AnswerRecord {
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  question_number?: number | null;
  question_text: string;
  options: Record<string, string>;
  explanation?: string | null;
  topic?: string | null;
  subtopic?: string | null;
  source_page?: number | null;
  source_region?: string | null;
  extraction_confidence?: number | null;
  answer_confidence?: number | null;
}

export function ReviewedQuizClient({ uploadId, questions }: ReviewedQuizClientProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<"active" | "feedback" | "finished">("active");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const current = questions[index];
  const correctCount = answers.filter((a) => a.is_correct).length;
  const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  const chooseAnswer = (key: string) => {
    if (phase !== "active") return;
    setSelected(key);
    const isCorrect = key === current.answer_key;
    setAnswers((prev) => [
      ...prev,
      {
        question_id: current.id,
        selected_answer: key,
        correct_answer: current.answer_key,
        is_correct: isCorrect,
        question_number: current.question_number ?? index + 1,
        question_text: current.question_text,
        options: current.options,
        explanation: current.explanation,
        topic: current.topic,
        subtopic: current.subtopic,
        source_page: current.source_page,
        source_region: current.source_region,
        extraction_confidence: current.confidence,
        answer_confidence: current.answer_confidence,
      },
    ]);
    setPhase("feedback");
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setPhase("finished");
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setPhase("active");
  };

  const saveSession = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/custom-quiz-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_id: uploadId,
          total_questions: answers.length,
          correct_count: correctCount,
          responses: answers,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message ?? "Gagal menyimpan sesi.");
      }
      setSavedSessionId(data.data.session_id);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  if (!current && phase !== "finished") {
    return <p className="text-sm text-navy-500">Tidak ada soal tersedia.</p>;
  }

  if (phase === "finished") {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-sm text-navy-500">Quiz selesai</p>
        <h1 className="mt-2 text-4xl font-bold text-navy-900">{score}%</h1>
        <p className="mt-2 text-sm text-navy-500">
          {correctCount} benar dari {answers.length} soal reviewed.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={saveSession} disabled={saveState === "saving" || saveState === "saved"}>
            {saveState === "saved" ? "Tersimpan" : saveState === "saving" ? "Menyimpan..." : "Simpan Hasil"}
          </Button>
          {savedSessionId && (
            <Link href={`/custom-results/${savedSessionId}`}>
              <Button variant="secondary">Lihat Detail Hasil</Button>
            </Link>
          )}
          <Link href={`/uploads/${uploadId}/review`}>
            <Button variant="secondary">Kembali Review</Button>
          </Link>
        </div>
        {saveState === "error" && (
          <p className="mt-3 text-sm text-red-500">Gagal menyimpan hasil.</p>
        )}
      </Card>
    );
  }

  const optionKeys = Object.keys(current.options ?? {}).sort();
  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-navy-500">
            Soal {index + 1} / {questions.length}
          </span>
          <Badge variant="info">{progress}%</Badge>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-200">
          <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Card padding="lg">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="default">{current.topic ?? "Custom Upload"}</Badge>
          {current.subtopic && <Badge variant="info">{current.subtopic}</Badge>}
        </div>
        <p className="whitespace-pre-wrap text-base font-medium leading-7 text-navy-900">
          {current.question_text}
        </p>
      </Card>

      <div className="space-y-3">
        {optionKeys.map((key) => {
          const isSelected = selected === key;
          const isCorrect = current.answer_key === key;
          const showState = phase === "feedback";
          return (
            <button
              key={key}
              onClick={() => chooseAnswer(key)}
              disabled={phase === "feedback"}
              className={`w-full rounded-2xl border px-5 py-4 text-left transition-all ${
                showState && isCorrect
                  ? "border-success-300 bg-success-50"
                  : showState && isSelected
                  ? "border-danger-300 bg-danger-50"
                  : "border-navy-200 bg-white hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              <span className="font-semibold text-navy-700">{key}. </span>
              <span className="text-navy-700">{current.options[key]}</span>
            </button>
          );
        })}
      </div>

      {phase === "feedback" && (
        <Card padding="md">
          <p className="text-sm font-semibold text-navy-900">
            {selected === current.answer_key ? "Benar ✅" : `Belum tepat. Jawaban: ${current.answer_key}`}
          </p>
          {current.explanation && (
            <p className="mt-2 text-sm text-navy-500">{current.explanation}</p>
          )}
          <Button className="mt-4" onClick={next}>
            {index + 1 >= questions.length ? "Selesai" : "Soal Berikutnya"}
          </Button>
        </Card>
      )}
    </div>
  );
}
