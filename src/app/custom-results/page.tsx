import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomResultsPage() {
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

  const { data: sessions } = await supabase
    .from("quiz_sessions")
    .select("id, finished_at, total_questions, correct_count, overall_percent, created_at")
    .eq("user_id", user.id)
    .eq("mode", "reviewed-upload")
    .order("finished_at", { ascending: false });

  const list = sessions ?? [];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Hasil Quiz Upload</h1>
            <p className="text-sm text-navy-500">
              Riwayat latihan dari soal upload yang sudah kamu review.
            </p>
          </div>
          <Link href="/uploads">
            <Button variant="secondary">Lihat Upload</Button>
          </Link>
        </div>

        {list.length === 0 ? (
          <Card padding="lg" className="text-center">
            <h2 className="mb-2 text-lg font-bold text-navy-900">
              Belum ada hasil custom quiz
            </h2>
            <p className="mb-6 text-sm text-navy-500">
              Upload soal, approve hasil ekstraksi, lalu mulai quiz dari soal approved.
            </p>
            <Link href="/uploads">
              <Button>Mulai dari Upload Saya</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((session) => (
              <Link key={session.id} href={`/custom-results/${session.id}`}>
                <Card hover padding="md" className="cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-navy-900">
                        Custom Quiz Upload
                      </p>
                      <p className="text-xs text-navy-400">
                        {new Date(session.finished_at ?? session.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">
                        {session.correct_count}/{session.total_questions}
                      </Badge>
                      <Badge variant={(session.overall_percent ?? 0) >= 70 ? "success" : "warning"}>
                        {session.overall_percent}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
