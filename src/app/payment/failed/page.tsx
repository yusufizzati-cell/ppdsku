import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-50">
          <XCircle size={28} className="text-danger-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-navy-900">
          Pembayaran Belum Berhasil
        </h1>
        <p className="mb-6 text-sm text-navy-500">
          Pembayaran dibatalkan atau kedaluwarsa. Kamu bisa coba lagi kapan saja.
        </p>
        <Link href="/upgrade">
          <Button size="lg" fullWidth>
            Coba Lagi
          </Button>
        </Link>
      </Card>
    </div>
  );
}
