import Link from "next/link";
import { ArrowRight, BookOpen, Target, TrendingUp } from "lucide-react";
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

type TopicInsight = {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  lastSeen: string;
  subtopics: Array<{ name: string; wrong: number; total: number }>;
  latestWrong?: Attempt;
};

export default async function LearningInsightsPage() {
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
  const insights = buildTopicInsights(list);
  const weakTopics = insights.filter((i) => i.wrong > 0).slice(0, 5);
  const totalAnswered = list.length;
  const totalWrong = list.filter((a) => !a.is_correct).length;
  const totalCorrect = totalAnswered - totalWrong;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const nextFocus = weakTopics[0];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-700">Sprint P7</p>
            <h1 className="text-2xl font-bold text-navy-900">Learning Insights</h1>
            <p className="text-sm text-navy-500">
              Ringkasan performa dari quiz upload: topik lemah, fokus berikutnya, dan rekomendasi review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/mistakes">
              <Button variant="secondary">Mistake Book</Button>
            </Link>
            <Link href="/uploads">
              <Button>Latihan Lagi</Button>
            </Link>
          </div>
        </div>

        {totalAnswered === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <MetricCard label="Soal dijawab" value={totalAnswered} icon={<BookOpen size={18} />} />
              <MetricCard label="Akurasi" value={`${overallAccuracy}%`} icon={<TrendingUp size={18} />} />
              <MetricCard label="Benar" value={totalCorrect} tone="success" />
              <MetricCard label="Salah" value={totalWrong} tone="danger" />
            </div>

            <Card padding="lg" className="border-primary-200 bg-primary-50/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Target className="text-primary-700" size={20} />
                    <h2 className="text-lg font-bold text-navy-900">Next Focus</h2>
                  </div>
                  {nextFocus ? (
                    <>
                      <p className="text-sm text-navy-600">
                        Fokus review berikutnya: <span className="font-semibold text-navy-900">{nextFocus.topic}</span>.
                        Ada {nextFocus.wrong} salah dari {nextFocus.total} attempt terakhir.
                      </p>
                      <p className="mt-2 text-sm text-navy-500">
                        Saran: buka mistake book topik ini, review 3 soal salah, lalu ulang quiz dari upload yang sama.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-navy-600">
                      Belum ada jawaban salah di data terakhir. Pertahankan ritme, tambah latihan dari upload baru.
                    </p>
                  )}
                </div>
                {nextFocus && (
                  <Link href={`/mistakes?topic=${encodeURIComponent(nextFocus.topic)}`}>
                    <Button size="sm">
                      Review topik ini
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              {weakTopics.length === 0 ? (
                <Card padding="lg">
                  <h2 className="mb-2 text-lg font-bold text-navy-900">Topik lemah belum muncul</h2>
                  <p className="text-sm text-navy-500">
                    Semua attempt terakhir benar. Learning insights akan makin tajam setelah data quiz bertambah.
                  </p>
                </Card>
              ) : (
                weakTopics.map((topic, index) => (
                  <TopicInsightCard key={topic.topic} insight={topic} rank={index + 1} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function buildTopicInsights(attempts: Attempt[]): TopicInsight[] {
  const byTopic = new Map<string, TopicInsight>();

  for (const attempt of attempts) {
    const topicName = attempt.topic || "Custom Upload";
    const current = byTopic.get(topicName) ?? {
      topic: topicName,
      total: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      lastSeen: attempt.created_at,
      subtopics: [],
      latestWrong: undefined,
    };

    current.total += 1;
    current.correct += attempt.is_correct ? 1 : 0;
    current.wrong += attempt.is_correct ? 0 : 1;
    current.lastSeen = current.lastSeen > attempt.created_at ? current.lastSeen : attempt.created_at;

    if (!attempt.is_correct && !current.latestWrong) {
      current.latestWrong = attempt;
    }

    if (attempt.subtopic) {
      const existing = current.subtopics.find((s) => s.name === attempt.subtopic);
      if (existing) {
        existing.total += 1;
        existing.wrong += attempt.is_correct ? 0 : 1;
      } else {
        current.subtopics.push({
          name: attempt.subtopic,
          total: 1,
          wrong: attempt.is_correct ? 0 : 1,
        });
      }
    }

    byTopic.set(topicName, current);
  }

  return Array.from(byTopic.values())
    .map((topic) => ({
      ...topic,
      accuracy: topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0,
      subtopics: topic.subtopics
        .filter((s) => s.wrong > 0)
        .sort((a, b) => b.wrong - a.wrong || b.total - a.total)
        .slice(0, 3),
    }))
    .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy || b.total - a.total);
}

function MetricCard({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "danger";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "text-success-700"
      : tone === "danger"
      ? "text-danger-700"
      : "text-navy-900";

  return (
    <Card padding="md">
      <div className="mb-2 flex items-center justify-between text-navy-400">
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function TopicInsightCard({ insight, rank }: { insight: TopicInsight; rank: number }) {
  const risk = insight.accuracy < 50 ? "danger" : insight.accuracy < 70 ? "warning" : "info";

  return (
    <Card padding="lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="danger">Prioritas #{rank}</Badge>
            <Badge variant={risk}>{insight.accuracy}% akurasi</Badge>
          </div>
          <h2 className="text-lg font-bold text-navy-900">{insight.topic}</h2>
          <p className="text-sm text-navy-500">
            {insight.wrong} salah / {insight.total} attempt terakhir
          </p>
        </div>
        <Link href={`/mistakes?topic=${encodeURIComponent(insight.topic)}`}>
          <Button variant="secondary" size="sm">Review</Button>
        </Link>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-navy-100">
        <div
          className={`h-full rounded-full ${
            risk === "danger" ? "bg-danger-500" : risk === "warning" ? "bg-warning-500" : "bg-primary-500"
          }`}
          style={{ width: `${Math.max(6, insight.accuracy)}%` }}
        />
      </div>

      {insight.subtopics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {insight.subtopics.map((s) => (
            <Badge key={s.name} variant="default">
              {s.name}: {s.wrong} salah
            </Badge>
          ))}
        </div>
      )}

      {insight.latestWrong && (
        <div className="rounded-xl bg-navy-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-400">Contoh salah terakhir</p>
          <p className="line-clamp-3 text-sm text-navy-700">{insight.latestWrong.question_text}</p>
          <Link
            href={`/custom-results/${insight.latestWrong.session_id}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Buka hasil lengkap <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </Card>
  );
}

function EmptyState() {
  return (
    <Card padding="lg" className="text-center">
      <h2 className="mb-2 text-lg font-bold text-navy-900">Belum ada data learning insights</h2>
      <p className="mx-auto mb-6 max-w-xl text-sm text-navy-500">
        Kerjakan quiz dari soal upload yang sudah approved. Setelah ada attempt, halaman ini akan merangkum topik lemah dan next focus otomatis.
      </p>
      <Link href="/uploads">
        <Button>Mulai dari Upload Saya</Button>
      </Link>
    </Card>
  );
}
