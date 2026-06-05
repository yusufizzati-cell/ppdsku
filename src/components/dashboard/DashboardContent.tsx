import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DashboardData } from "@/lib/dashboard-data";
import {
  TrendingUp,
  BookOpen,
  Flame,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  "very-low": "bg-danger-500",
  low: "bg-warning-500",
  medium: "bg-primary-500",
  high: "bg-success-500",
  "very-high": "bg-success-600",
};

export function DashboardContent({ data }: { data: DashboardData | null }) {
  // Guest fallback (shouldn't normally happen — middleware guards this route)
  if (!data) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-navy-500">Silakan login untuk melihat dashboard.</p>
        <Link href="/auth/login" className="mt-4 inline-block">
          <Button>Masuk</Button>
        </Link>
      </Card>
    );
  }

  // Empty state — user hasn't done any quiz yet
  if (!data.hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Halo{data.profileName ? `, ${data.profileName}` : ""} 👋
          </h1>
          <p className="text-sm text-navy-500">Onkologi Radiasi</p>
        </div>
        <Card padding="lg" className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <Sparkles size={28} className="text-primary-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-navy-900">
            Mulai quiz pertama kamu
          </h2>
          <p className="mb-6 text-sm text-navy-500">
            Kerjakan quiz adaptif untuk membangun peta penguasaan topik dan
            mendapatkan rekomendasi belajar.
          </p>
          <Link href="/onkrad/quiz">
            <Button size="lg">Mulai Quiz</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { kpis, priorityTopics, recentSessions, profileName } = data;

  const kpiCards = [
    {
      label: "Skor Kesiapan",
      value: String(kpis.readinessScore),
      suffix: "/100",
      icon: Target,
    },
    {
      label: "Soal Selesai",
      value: String(kpis.questionsCompleted),
      suffix: "",
      icon: BookOpen,
    },
    {
      label: "Streak Belajar",
      value: String(kpis.studyStreak),
      suffix: " hari",
      icon: Flame,
    },
    {
      label: "Akurasi",
      value: String(kpis.accuracy),
      suffix: "%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Halo{profileName ? `, ${profileName}` : ""}
        </h1>
        <p className="text-sm text-navy-500">Onkologi Radiasi — Peta belajar kamu</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-navy-400">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">
                  {kpi.value}
                  <span className="text-sm font-normal text-navy-400">
                    {kpi.suffix}
                  </span>
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                <kpi.icon size={18} className="text-primary-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Priority Topics */}
      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">Topik Prioritas</h2>
          <Link href="/onkrad/quiz">
            <Button size="sm" variant="secondary">
              Latih Topik Lemah
            </Button>
          </Link>
        </div>
        {priorityTopics.length === 0 ? (
          <p className="text-sm text-navy-400">Belum ada data topik.</p>
        ) : (
          <div className="space-y-3">
            {priorityTopics.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <span className="w-32 truncate text-sm text-navy-600 sm:w-44">
                  {t.topic}
                </span>
                <div className="flex-1">
                  <div className="h-2.5 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className={`h-full rounded-full ${statusColors[t.status]}`}
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-sm font-semibold text-navy-700">
                  {t.percent}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Sessions */}
      <Card padding="lg">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Riwayat Quiz</h2>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-navy-400">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-navy-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-navy-900">
                    Quiz Adaptif
                  </p>
                  <p className="text-xs text-navy-400">
                    {new Date(s.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {s.correctCount}/{s.totalQuestions} benar
                  </p>
                </div>
                <span className="text-lg font-bold text-navy-900">
                  {s.overallPercent}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Action */}
      <Link href="/onkrad/quiz">
        <Card hover padding="md" className="cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <BookOpen size={20} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-900">
                Mulai Quiz Adaptif
              </p>
              <p className="text-xs text-navy-500">
                Sistem pilihkan soal terbaik untuk kamu
              </p>
            </div>
            <ArrowRight size={16} className="text-navy-400" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
