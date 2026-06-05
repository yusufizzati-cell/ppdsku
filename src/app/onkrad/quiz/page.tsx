"use client";

import { useEffect } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { QuizActive } from "@/components/quiz/QuizActive";
import { QuizFeedback } from "@/components/quiz/QuizFeedback";
import { ExtendPrompt } from "@/components/quiz/ExtendPrompt";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuestionItem } from "@/engine/irt";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function OnkradQuizPage() {
  const { phase, loadQuestions, startQuiz, error } = useQuizStore();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/onkrad.json");
        const data: QuestionItem[] = await res.json();
        loadQuestions(data);
      } catch {
        // Error handled by store
      }
    }

    if (phase === "idle") {
      load();
    }
  }, [phase, loadQuestions]);

  // Auto-start after loading
  useEffect(() => {
    if (phase === "idle") {
      const store = useQuizStore.getState();
      if (store.questions.length > 0 && store.totalAnswered === 0) {
        startQuiz();
      }
    }
  }, [phase, startQuiz]);

  if (phase === "loading" || (phase === "idle" && !error)) {
    return <QuizLoading />;
  }

  if (phase === "error" || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <div className="text-center">
          <p className="mb-4 text-lg text-danger-600">
            {error || "Bank soal belum berhasil dimuat."}
          </p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-navy-900">Quiz Selesai!</h2>
          <Link href="/onkrad/result">
            <Button size="lg">Lihat Hasil Analisis</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="border-b border-navy-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700">
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <span className="text-sm font-medium text-navy-700">Onkologi Radiasi</span>
        </div>
      </header>

      {/* Quiz Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {phase === "active" && <QuizActive />}
        {phase === "feedback" && <QuizFeedback />}
        {phase === "extend-prompt" && <ExtendPrompt />}
      </div>
    </div>
  );
}
