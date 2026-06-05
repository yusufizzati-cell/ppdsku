import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Mistake = {
  id: string;
  session_id: string;
  question_text: string;
  options: Record<string, string> | null;
  selected_answer: string;
  correct_answer: string;
  explanation: string | null;
  topic: string | null;
  subtopic: string | null;
  created_at: string;
};

export default async function MistakesPage({
  searchParams,
}: {
  searchParams?: { topic?: string };
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

  const { data: allMistakes } = await supabase
    .from("custom_question_attempts")
    .select("topic")
    .eq("user_id", user.id)
    .eq("is_correct", false);

  const topics = Array.from(
    new Set((allMistakes ?? []).map((m) => m.topic).filter(Boolean) as string[])
  ).sort();

  let query = supabase
    .from("custom_question_attempts")
    .select("id, session_id, question_text, options, selected_answer, correct_answer, explanation, topic, subtopic, created_at")
    .eq("user_id", user.id)
    .eq("is_correct", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams?.topic) {
    query = query.eq("topic", searchParams.topic);
  }

  const { data: mistakes } = await query;
  const list = (mistakes ?? []) as Mistake[];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Mistake Book</h1>
            <p className="text-sm text-navy-500">
              Kumpulan soal upload yang pernah kamu jawab salah. Fokus ulang di sini.
            </p>
          </div>
          <Link href="/custom-results">
            <Button variant="secondary">Riwayat Hasil</Button>
          </Link>
        </div>

        <Card padding="md">
          <div className="flex flex-wrap gap-2">
            <Link href="/mistakes">
              <Badge variant={!searchParams?.topic ? "success" : "default"}>Semua</Badge>
            </Link>
            {topics.map((topic) => (
              <Link key={topic} href={`/mistakes?topic=${encodeURIComponent(topic)}`}>
                <Badge variant={searchParams?.topic === topic ? "success" : "default"}>{topic}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        {list.length === 0 ? (
          <Card padding="lg" className="text-center">
            <h2 className="mb-2 text-lg font-bold text-navy-900">Belum ada mistake tersimpan</h2>
            <p className="mb-6 text-sm text-navy-500">
              Kerjakan custom quiz dari soal approved. Jawaban salah akan otomatis masuk ke sini.
            </p>
            <Link href="/uploads">
              <Button>Mulai dari Upload Saya</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {list.map((m, idx) => (
              <Card key={m.id} padding="lg">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="danger">Salah #{idx + 1}</Badge>
                  <Badge variant="default">{m.topic ?? "Custom Upload"}</Badge>
                  {m.subtopic && <Badge variant="info">{m.subtopic}</Badge>}
                </div>

                <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-navy-900">
                  {m.question_text}
                </p>

                <div className="mt-4 space-y-2">
                  {Object.keys(m.options ?? {}).sort().map((key) => {
                    const isUser = key === m.selected_answer;
                    const isCorrect = key === m.correct_answer;
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
                        <span>{m.options?.[key]}</span>
                        {isCorrect && <span className="ml-2 font-semibold">Kunci</span>}
                        {isUser && !isCorrect && <span className="ml-2 font-semibold">Jawaban kamu</span>}
                      </div>
                    );
                  })}
                </div>

                {m.explanation && (
                  <p className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-navy-700">
                    {m.explanation}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-navy-400">
                  <span>{new Date(m.created_at).toLocaleString("id-ID")}</span>
                  <Link href={`/custom-results/${m.session_id}`} className="font-semibold text-primary-700 hover:text-primary-800">
                    Buka hasil lengkap
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
