import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";
import { getSubscriptionStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage() {
  // Server-validated PRO check — never trust the URL alone
  const status = await getSubscriptionStatus();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50">
          <CheckCircle2 size={28} className="text-success-600" />
        </div>

        {status.isPro ? (
          <>
            <h1 className="mb-2 text-xl font-bold text-navy-900">
              Pembayaran Berhasil
            </h1>
            <p className="mb-6 text-sm text-navy-500">
              PRO kamu sudah aktif. Sekarang kamu bisa akses full analysis, study
              plan, dan semua fitur premium.
            </p>
            <Link href="/dashboard">
              <Button size="lg" fullWidth>
                Buka Dashboard
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-bold text-navy-900">
              Status Belum Terkonfirmasi
            </h1>
            <p className="mb-6 text-sm text-navy-500">
              Kami belum menerima konfirmasi pembayaran. Jika kamu sudah membayar,
              tunggu beberapa saat lalu cek status lagi.
            </p>
            <Link href="/payment/pending">
              <Button size="lg" variant="secondary" fullWidth>
                Cek Status Pembayaran
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
