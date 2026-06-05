import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock, Target } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Attempt = {
  id: string;
  session_id: string;
  question_text: string;
  is_correct: boolean;
  topic: string | null;
  subtopic: string | null;
  created_at: string;
};

type FocusTopic = {
  topic: string;
  total: number;
  wrong: number;
  accuracy: number;
  subtopics: string[];
  latestSessionId?: string;
};

export default async function StudyPlanPage() {
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

  const { data: attempts } = await supabase
    .from("custom_question_attempts")
    .select("id, session_id, question_text, is_correct, topic, subtopic, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(300);

  const list = (attempts ?? []) as Attempt[];
  const focusTopics = buildFocusTopics(list).slice(0, 3);
  const plan = buildSevenDayPlan(focusTopics);
  const totalWrong = list.filter((a) => !a.is_correct).length;
  const hasData = list.length > 0;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-700">Sprint P8</p>
            <h1 className="text-2xl font-bold text-navy-900">AI Study Plan</h1>
            <p className="text-sm text-navy-500">
              Rencana 7 hari otomatis dari performa quiz upload dan mistake book.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/learning-insights">
              <Button variant="secondary">Learning Insights</Button>
            </Link>
            <Link href="/uploads">
              <Button>Latihan Lagi</Button>
            </Link>
          </div>
        </div>

        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard label="Data latihan" value={`${list.length} soal`} />
              <SummaryCard label="Mistake aktif" value={`${totalWrong} salah`} tone="danger" />
              <SummaryCard label="Fokus minggu ini" value={`${focusTopics.length || 1} topik`} tone="info" />
            </div>

            <Card padding="lg" className="border-primary-200 bg-primary-50/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Target size={20} className="text-primary-700" />
                    <h2 className="text-lg font-bold text-navy-900">Target Minggu Ini</h2>
                  </div>
                  <p className="text-sm text-navy-600">
                    {focusTopics[0]
                      ? `Naikkan akurasi topik ${focusTopics[0].topic} dengan review pendek harian + ulang soal salah.`
                      : "Pertahankan akurasi dengan latihan ringan dan tambah data dari upload baru."}
                  </p>
                </div>
                {focusTopics[0] && (
                  <Link href={`/mistakes?topic=${encodeURIComponent(focusTopics[0].topic)}`}>
                    <Button size="sm">Mulai Review</Button>
                  </Link>
                )}
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card padding="lg">
                <div className="mb-5 flex items-center gap-2">
                  <CalendarCheck size={20} className="text-primary-700" />
                  <h2 className="text-lg font-bold text-navy-900">Plan 7 Hari</h2>
                </div>
                <div className="space-y-3">
                  {plan.map((day) => (
                    <div key={day.day} className="rounded-2xl border border-navy-100 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={day.kind === "review" ? "danger" : day.kind === "quiz" ? "info" : "success"}>
                            Hari {day.day}
                          </Badge>
                          <p className="font-semibold text-navy-900">{day.title}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs text-navy-400">
                          <Clock size={13} /> {day.duration}
                        </span>
                      </div>
                      <p className="text-sm text-navy-600">{day.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="lg">
                <h2 className="mb-4 text-lg font-bold text-navy-900">Prioritas Topik</h2>
                {focusTopics.length === 0 ? (
                  <p className="text-sm text-navy-500">
                    Belum ada topik lemah. Tambah latihan atau upload materi baru.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {focusTopics.map((topic, index) => (
                      <div key={topic.topic} className="rounded-2xl bg-navy-50 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div>
                            <Badge variant="warning">Prioritas #{index + 1}</Badge>
                            <h3 className="mt-2 font-semibold text-navy-900">{topic.topic}</h3>
                          </div>
                          <Badge variant={topic.accuracy < 50 ? "danger" : "warning"}>
                            {topic.accuracy}%
                          </Badge>
                        </div>
                        <p className="text-sm text-navy-500">
                          {topic.wrong} salah dari {topic.total} attempt.
                        </p>
                        {topic.subtopics.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {topic.subtopics.map((s) => (
                              <Badge key={s} variant="default">{s}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Link href={`/mistakes?topic=${encodeURIComponent(topic.topic)}`}>
                            <Button variant="secondary" size="sm">Mistakes</Button>
                          </Link>
                          {topic.latestSessionId && (
                            <Link href={`/custom-results/${topic.latestSessionId}`}>
                              <Button variant="ghost" size="sm">Hasil terakhir</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function buildFocusTopics(attempts: Attempt[]): FocusTopic[] {
  const map = new Map<string, FocusTopic>();

  for (const attempt of attempts) {
    const topic = attempt.topic || "Custom Upload";
    const current = map.get(topic) ?? {
      topic,
      total: 0,
      wrong: 0,
      accuracy: 0,
      subtopics: [],
      latestSessionId: undefined,
    };

    current.total += 1;
    current.wrong += attempt.is_correct ? 0 : 1;
    if (!attempt.is_correct && !current.latestSessionId) {
      current.latestSessionId = attempt.session_id;
    }
    if (!attempt.is_correct && attempt.subtopic && !current.subtopics.includes(attempt.subtopic)) {
      current.subtopics.push(attempt.subtopic);
    }
    map.set(topic, current);
  }

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      accuracy: item.total > 0 ? Math.round(((item.total - item.wrong) / item.total) * 100) : 0,
      subtopics: item.subtopics.slice(0, 4),
    }))
    .filter((item) => item.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy || b.total - a.total);
}

function buildSevenDayPlan(focusTopics: FocusTopic[]) {
  const primary = focusTopics[0]?.topic ?? "materi upload terbaru";
  const secondary = focusTopics[1]?.topic ?? primary;
  const tertiary = focusTopics[2]?.topic ?? secondary;

  return [
    {
      day: 1,
      kind: "review",
      title: `Review ${primary}`,
      duration: "15–20 menit",
      description: "Buka mistake book, baca 3 soal salah, tulis pola jebakan dalam 3 bullet.",
    },
    {
      day: 2,
      kind: "quiz",
      title: `Ulang soal ${primary}`,
      duration: "20 menit",
      description: "Kerjakan ulang quiz dari upload terkait. Target bukan skor tinggi, tapi tahu alasan tiap jawaban.",
    },
    {
      day: 3,
      kind: "review",
      title: `Review ${secondary}`,
      duration: "15 menit",
      description: "Fokus ke subtopik yang muncul di chip prioritas. Jangan tambah materi baru dulu.",
    },
    {
      day: 4,
      kind: "quiz",
      title: "Mixed mini quiz",
      duration: "20–25 menit",
      description: `Campur ${primary} dan ${secondary}. Catat 1 konsep yang masih kabur.`,
    },
    {
      day: 5,
      kind: "review",
      title: `Review ${tertiary}`,
      duration: "15 menit",
      description: "Review ringan dari mistake book. Kalau topik sama, ulang dari soal yang paling bikin ragu.",
    },
    {
      day: 6,
      kind: "quiz",
      title: "Retest fokus minggu ini",
      duration: "25 menit",
      description: "Kerjakan quiz custom lagi. Bandingkan akurasi dengan hasil sebelumnya di Learning Insights.",
    },
    {
      day: 7,
      kind: "reflect",
      title: "Weekly checkpoint",
      duration: "10 menit",
      description: "Buka Learning Insights, pilih topik prioritas minggu depan berdasarkan salah terbanyak terbaru.",
    },
  ] as const;
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "info";
}) {
  const valueClass = tone === "danger" ? "text-danger-700" : tone === "info" ? "text-primary-700" : "text-navy-900";

  return (
    <Card padding="md">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card padding="lg" className="text-center">
      <CheckCircle2 className="mx-auto mb-4 text-primary-600" size={36} />
      <h2 className="mb-2 text-lg font-bold text-navy-900">Study plan belum punya data</h2>
      <p className="mx-auto mb-6 max-w-xl text-sm text-navy-500">
        Kerjakan quiz dari soal upload yang sudah approved. Setelah ada attempt, study plan 7 hari akan dibuat otomatis dari topik lemah.
      </p>
      <Link href="/uploads">
        <Button>Mulai dari Upload Saya</Button>
      </Link>
    </Card>
  );
}
