"use client";

import { useEffect, useState } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowRight, RotateCcw, TrendingUp, Check, Save } from "lucide-react";
import Link from "next/link";
import { RadarPreview } from "@/components/result/RadarPreview";
import { persistQuizSession } from "@/lib/quiz-persistence";
import { useSubscription } from "@/hooks/useSubscription";

type SaveState = "idle" | "saving" | "saved" | "guest" | "error";

export default function OnkradResultPage() {
  const { sessionResult, topicAbilities, responses, persisted, markPersisted, resetQuiz } =
    useQuizStore();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const { isPro } = useSubscription();

  // Auto-persist for logged-in users (once per finished session)
  useEffect(() => {
    if (!sessionResult || persisted) return;

    let cancelled = false;
    setSaveState("saving");

    persistQuizSession({
      specialty: "onkrad",
      mode: "adaptive",
      result: sessionResult,
      responses,
    })
      .then((outcome) => {
        if (cancelled) return;
        if (!outcome.authenticated) {
          setSaveState("guest");
        } else if (outcome.ok) {
          markPersisted();
          setSaveState("saved");
        } else {
          setSaveState("error");
        }
      })
      .catch(() => {
        if (!cancelled) setSaveState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [sessionResult, persisted, responses, markPersisted]);

  if (!sessionResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <div className="text-center">
          <p className="mb-4 text-navy-500">Belum ada hasil quiz.</p>
          <Link href="/onkrad/quiz">
            <Button>Mulai Quiz</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { totalQuestions, correctCount, overallPercent, topicBreakdown, weakTopics } =
    sessionResult;

  const handleRetry = () => {
    resetQuiz();
  };

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="border-b border-navy-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-sm text-navy-500 hover:text-navy-700">
            ← Beranda
          </Link>
          <span className="text-sm font-medium text-navy-700">Hasil Analisis</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Save status banner */}
        {saveState === "saved" && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-50 p-3 text-sm text-success-700">
            <Check size={16} />
            Progress tersimpan ke akun kamu.
          </div>
        )}
        {saveState === "saving" && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary-50 p-3 text-sm text-primary-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            Menyimpan progress...
          </div>
        )}
        {saveState === "guest" && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <Save size={16} />
              Daftar untuk menyimpan progress dan lihat dashboard kamu.
            </div>
            <Link href="/auth/register">
              <Button size="sm">Simpan Progress</Button>
            </Link>
          </div>
        )}
        {saveState === "error" && (
          <div className="mb-4 rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
            Progress belum tersimpan. Coba refresh atau cek koneksi.
          </div>
        )}

        {/* Overall Score */}
        <Card padding="lg" className="mb-6 text-center">
          <p className="mb-1 text-sm text-navy-500">Skor Keseluruhan</p>
          <p className="text-5xl font-bold text-navy-900">{overallPercent}%</p>
          <p className="mt-2 text-sm text-navy-500">
            {correctCount} benar dari {totalQuestions} soal
          </p>
          <p className="mt-3 text-sm text-navy-600">
            {overallPercent >= 75
              ? "Bagus! Kamu sudah cukup siap, tetapi tetap perkuat topik lemah."
              : overallPercent >= 50
              ? "Cukup. Ada beberapa gap yang perlu diperbaiki."
              : "Masih banyak gap. Perlu fokus belajar di topik-topik tertentu."}
          </p>
        </Card>

        {/* Radar Chart Preview (visible for all) */}
        <Card padding="lg" className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-navy-900">Peta Penguasaan Topik</h3>
          <RadarPreview topicAbilities={topicAbilities} />
        </Card>

        {/* Topic Breakdown - full for PRO, blurred for free */}
        <Card padding="lg" className="relative mb-6">
          <h3 className="mb-4 text-lg font-semibold text-navy-900">Detail Per Topik</h3>
          <div className="space-y-3">
            {topicBreakdown.map((topic) => {
              const statusColors = {
                "very-low": "bg-danger-500",
                low: "bg-warning-500",
                medium: "bg-primary-500",
                high: "bg-success-500",
                "very-high": "bg-success-600",
              };
              return (
                <div key={topic.topic} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-navy-600 truncate sm:w-40">
                    {topic.topic}
                  </span>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-navy-100">
                      <div
                        className={`h-full rounded-full ${statusColors[topic.status]} transition-all`}
                        style={{ width: `${topic.percent}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`w-12 text-right text-sm font-semibold ${
                      isPro
                        ? "text-navy-700"
                        : "text-navy-400 blur-sm select-none"
                    }`}
                  >
                    {topic.percent}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Locked Overlay — only for non-PRO */}
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center rounded-card bg-white/80 backdrop-blur-sm">
              <div className="text-center px-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <Lock size={20} className="text-primary-600" />
                </div>
                <p className="mb-1 text-sm font-semibold text-navy-900">
                  Detail Topik Terkunci
                </p>
                <p className="mb-4 text-xs text-navy-500">
                  Upgrade ke PRO untuk melihat breakdown lengkap per topik dan rekomendasi belajar.
                </p>
                <Link href="/upgrade">
                  <Button size="sm">Unlock Full Analysis</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Gap Analysis - full for PRO, locked for free */}
        <Card padding="lg" className="relative mb-6">
          <h3 className="mb-3 text-lg font-semibold text-navy-900">Gap Analysis</h3>
          {isPro ? (
            <div className="space-y-2">
              {weakTopics.length === 0 ? (
                <p className="text-sm text-navy-500">
                  Tidak ada gap signifikan terdeteksi. Pertahankan!
                </p>
              ) : (
                weakTopics.slice(0, 5).map((topic) => (
                  <div key={topic} className="rounded-xl bg-danger-50 p-3">
                    <p className="text-sm font-medium text-danger-700">{topic}</p>
                    <p className="text-xs text-danger-600">
                      Prioritas belajar — penguasaan masih rendah
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2 blur-sm select-none">
                {weakTopics.slice(0, 3).map((topic) => (
                  <div key={topic} className="rounded-xl bg-danger-50 p-3">
                    <p className="text-sm font-medium text-danger-700">{topic}</p>
                    <p className="text-xs text-danger-600">Perlu prioritas belajar</p>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-card bg-white/80 backdrop-blur-sm">
                <div className="text-center px-6">
                  <Lock size={20} className="mx-auto mb-2 text-navy-400" />
                  <p className="text-sm font-medium text-navy-700">
                    Gap Analysis — PRO Only
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* CTA Section */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/upgrade">
            <Card hover padding="md" className="cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <TrendingUp size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">Upgrade ke PRO</p>
                  <p className="text-xs text-navy-500">Full analysis + study plan</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-navy-400" />
              </div>
            </Card>
          </Link>
          <Link href="/onkrad/quiz" onClick={handleRetry}>
            <Card hover padding="md" className="cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <RotateCcw size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">Coba Lagi</p>
                  <p className="text-xs text-navy-500">Latih topik lemah kamu</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-navy-400" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
