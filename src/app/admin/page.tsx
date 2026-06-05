import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { BarChart3, CreditCard, FileText, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  plan: string | null;
  created_at: string;
  paid_at: string | null;
};

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    notFound();
  }

  const admin = createAdminClient();
  const [profiles, uploads, sessions, payments, subscriptions, extractionJobs] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("uploads").select("id", { count: "exact", head: true }),
    admin.from("quiz_sessions").select("id", { count: "exact", head: true }),
    admin.from("payments").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("extraction_jobs").select("id, status", { count: "exact" }).limit(200),
  ]);

  const { data: recentPayments } = await admin
    .from("payments")
    .select("id, order_id, amount, status, plan, created_at, paid_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const jobs = extractionJobs.data ?? [];
  const failedJobs = jobs.filter((j) => j.status === "failed").length;
  const completedJobs = jobs.filter((j) => j.status === "completed" || j.status === "succeeded").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-primary-700">Admin</p>
          <h1 className="text-2xl font-bold text-navy-900">Operational Dashboard</h1>
          <p className="text-sm text-navy-500">
            Pantau user, upload, quiz, extraction, subscription, dan payment Midtrans.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<Users size={18} />} label="Users" value={profiles.count ?? 0} />
          <Metric icon={<FileText size={18} />} label="Uploads" value={uploads.count ?? 0} />
          <Metric icon={<BarChart3 size={18} />} label="Quiz Sessions" value={sessions.count ?? 0} />
          <Metric icon={<CreditCard size={18} />} label="Payments" value={payments.count ?? 0} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card padding="lg">
            <p className="text-sm text-navy-400">Active PRO</p>
            <p className="mt-2 text-3xl font-bold text-success-700">{subscriptions.count ?? 0}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-navy-400">Extraction Success</p>
            <p className="mt-2 text-3xl font-bold text-primary-700">{completedJobs}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-navy-400">Extraction Failed</p>
            <p className="mt-2 text-3xl font-bold text-danger-700">{failedJobs}</p>
          </Card>
        </div>

        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Recent Payments</h2>
              <p className="text-sm text-navy-500">10 transaksi Midtrans terbaru.</p>
            </div>
            <Link href="/upgrade" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
              Test payment
            </Link>
          </div>
          <div className="space-y-3">
            {((recentPayments ?? []) as PaymentRow[]).length === 0 ? (
              <p className="text-sm text-navy-500">Belum ada payment.</p>
            ) : (
              ((recentPayments ?? []) as PaymentRow[]).map((payment) => (
                <div key={payment.id} className="flex flex-col gap-2 rounded-xl border border-navy-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-navy-900">{payment.order_id}</p>
                    <p className="text-xs text-navy-400">
                      {payment.plan ?? "unknown plan"} · {new Date(payment.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-navy-700">Rp{payment.amount.toLocaleString("id-ID")}</p>
                    <Badge variant={payment.status === "paid" ? "success" : payment.status === "pending" ? "warning" : "danger"}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card padding="md">
      <div className="mb-2 flex items-center justify-between text-navy-400">
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
    </Card>
  );
}
