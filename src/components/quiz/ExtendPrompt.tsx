"use client";

import { useQuizStore } from "@/store/quiz-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Target, Zap } from "lucide-react";

export function ExtendPrompt() {
  const { extendQuiz, finishQuiz, totalAnswered } = useQuizStore();

  return (
    <div className="flex items-center justify-center py-12">
      <Card padding="lg" className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <Target size={28} className="text-primary-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-navy-900">
          Mau analisis yang lebih akurat?
        </h2>
        <p className="mb-6 text-sm text-navy-500">
          Kamu sudah menjawab {totalAnswered} soal. Tambah 20 soal lagi agar mapping
          kelemahan kamu lebih tajam dan rekomendasi belajar lebih tepat.
        </p>
        <div className="space-y-3">
          <Button onClick={extendQuiz} fullWidth className="gap-2">
            <Zap size={16} />
            Tambah 20 Soal
          </Button>
          <Button onClick={finishQuiz} variant="secondary" fullWidth>
            Analisis Sekarang
          </Button>
        </div>
        <p className="mt-4 text-xs text-navy-400">
          Semakin banyak soal = mapping kelemahan semakin akurat
        </p>
      </Card>
    </div>
  );
}
