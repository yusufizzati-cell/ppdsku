import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    .eq("mode", "reviewed-upload")
    .maybeSingle();

  if (!session) notFound();

  const { data: responses } = await supabase
    .from("question_responses")
    .select("*")
    .eq("session_id", session.id)
    .order("answered_at", { ascending: true });

  const list = responses ?? [];

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
              <p className="text-sm text-navy-400">Hasil Custom Quiz Upload</p>
              <h1 className="text-4xl font-bold text-navy-900">
                {session.overall_percent}%
              </h1>
              <p className="mt-2 text-sm text-navy-500">
                {session.correct_count} benar dari {session.total_questions} soal
              </p>
            </div>
            <Badge variant={(session.overall_percent ?? 0) >= 70 ? "success" : "warning"}>
              {session.mode}
            </Badge>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total" value={session.total_questions ?? 0} />
          <Stat label="Benar" value={session.correct_count ?? 0} />
          <Stat label="Salah" value={(session.total_questions ?? 0) - (session.correct_count ?? 0)} />
        </div>

        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">Detail Jawaban</h2>
            <Link href="/uploads">
              <Button size="sm" variant="secondary">Latihan Lagi</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {list.map((r, idx) => (
              <div key={r.id} className="rounded-xl border border-navy-100 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="info">No. {idx + 1}</Badge>
                  <Badge variant={r.is_correct ? "success" : "danger"}>
                    {r.is_correct ? "Benar" : "Salah"}
                  </Badge>
                  <Badge variant="default">{r.topic}</Badge>
                </div>
                <p className="text-sm text-navy-700">
                  Jawaban kamu: <span className="font-semibold">{r.selected_answer}</span>
                </p>
                <p className="text-sm text-navy-700">
                  Kunci: <span className="font-semibold">{r.correct_answer}</span>
                </p>
                {r.subtopic && (
                  <p className="mt-1 text-xs text-navy-400">{r.subtopic}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
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
