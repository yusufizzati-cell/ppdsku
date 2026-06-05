import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Attempt = {
  id: string;
  question_number: number | null;
  question_text: string;
  options: Record<string, string> | null;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string | null;
  topic: string | null;
  subtopic: string | null;
  source_page: number | null;
  extraction_confidence: number | null;
  answer_confidence: number | null;
};

export default async function CustomResultDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <DashboardShell>
        <Card padding="lg" className="text-center">
          <p className="text-navy-500">Silakan login.</p>
        </Card>
      </DashboardShell>
    );
  }

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("mode", "reviewed-upload")
    .maybeSingle();

  if (!session) notFound();

  const { data: attempts } = await supabase
    .from("custom_question_attempts")
    .select("*")
    .eq("session_id", session.id)
    .order("question_number", { ascending: true });

  const richList = (attempts ?? []) as Attempt[];
  const wrongCount = richList.filter((a) => !a.is_correct).length;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/custom-results"
          className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
        >
          <ArrowLeft size={16} />
          Kembali ke riwayat
        </Link>

        <Card padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-navy-400">Review Hasil Custom Quiz</p>
              <h1 className="text-4xl font-bold text-navy-900">
                {session.overall_percent}%
              </h1>
              <p className="mt-2 text-sm text-navy-500">
                {session.correct_count} benar dari {session.total_questions} soal
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/mistakes">
                <Button variant="secondary" size="sm">
                  <RotateCcw size={16} />
                  Mistake Book
                </Button>
              </Link>
              <Badge variant={(session.overall_percent ?? 0) >= 70 ? "success" : "warning"}>
                {session.mode}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total" value={session.total_questions ?? 0} />
          <Stat label="Benar" value={session.correct_count ?? 0} />
          <Stat label="Salah" value={wrongCount} />
        </div>

        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Review Per Soal</h2>
              <p className="text-sm text-navy-500">
                Snapshot soal disimpan saat quiz, jadi aman walau hasil ekstraksi diedit belakangan.
              </p>
            </div>
            <Link href="/uploads">
              <Button size="sm" variant="secondary">Latihan Lagi</Button>
            </Link>
          </div>

          {richList.length === 0 ? (
            <p className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700">
              Result lama ini belum punya snapshot soal. Kerjakan quiz upload baru setelah Sprint P6 migration untuk melihat review lengkap.
            </p>
          ) : (
            <div className="space-y-5">
              {richList.map((item, idx) => (
                <QuestionReview key={item.id} item={item} fallbackNumber={idx + 1} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

function QuestionReview({ item, fallbackNumber }: { item: Attempt; fallbackNumber: number }) {
  const options = item.options ?? {};
  const optionKeys = Object.keys(options).sort();

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="info">No. {item.question_number ?? fallbackNumber}</Badge>
        <Badge variant={item.is_correct ? "success" : "danger"}>
          {item.is_correct ? "Benar" : "Salah"}
        </Badge>
        <Badge variant="default">{item.topic ?? "Custom Upload"}</Badge>
        {item.subtopic && <Badge variant="info">{item.subtopic}</Badge>}
      </div>

      <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-navy-900">
        {item.question_text}
      </p>

      <div className="mt-4 space-y-2">
        {optionKeys.map((key) => {
          const isUser = key === item.selected_answer;
          const isCorrect = key === item.correct_answer;
          return (
            <div
              key={key}
              className={`rounded-xl border px-4 py-3 text-sm ${
                isCorrect
                  ? "border-success-300 bg-success-50 text-success-800"
                  : isUser
                  ? "border-danger-300 bg-danger-50 text-danger-800"
                  : "border-navy-100 bg-navy-50 text-navy-700"
              }`}
            >
              <span className="font-semibold">{key}. </span>
              <span>{options[key]}</span>
              {isCorrect && <span className="ml-2 font-semibold">Kunci</span>}
              {isUser && !isCorrect && <span className="ml-2 font-semibold">Jawaban kamu</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 text-xs text-navy-500 sm:grid-cols-2">
        <p>Jawaban kamu: <span className="font-semibold">{item.selected_answer}</span></p>
        <p>Kunci: <span className="font-semibold">{item.correct_answer}</span></p>
        {item.source_page && <p>Halaman sumber: {item.source_page}</p>}
        {typeof item.answer_confidence === "number" && (
          <p>Confidence kunci: {Math.round(item.answer_confidence * 100)}%</p>
        )}
      </div>

      {item.explanation && (
        <div className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-navy-700">
          <p className="mb-1 font-semibold text-navy-900">Pembahasan</p>
          <p className="whitespace-pre-wrap">{item.explanation}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card padding="md" className="text-center">
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-xs text-navy-400">{label}</p>
    </Card>
  );
}
