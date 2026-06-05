"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, RefreshCw } from "lucide-react";

function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  const checkStatus = async () => {
    setChecking(true);
    setMessage("");
    try {
      const res = await fetch("/api/subscription/status", { cache: "no-store" });
      const json = await res.json();
      if (json?.data?.is_pro) {
        router.push("/payment/success");
        return;
      }
      setMessage("Pembayaran belum terkonfirmasi. Jika sudah membayar, tunggu beberapa saat lalu cek lagi.");
    } catch {
      setMessage("Gagal mengecek status. Coba lagi.");
    } finally {
      setChecking(false);
    }
  };

  // Auto-poll every 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/subscription/status", { cache: "no-store" });
        const json = await res.json();
        if (json?.data?.is_pro) {
          router.push("/payment/success");
        }
      } catch {
        // ignore poll errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-50">
          <Clock size={28} className="text-warning-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-navy-900">
          Menunggu Konfirmasi Pembayaran
        </h1>
        <p className="mb-2 text-sm text-navy-500">
          Scan QRIS dari aplikasi pembayaran kamu. Setelah membayar, status akan
          otomatis terupdate.
        </p>
        {orderId && (
          <p className="mb-6 text-xs text-navy-400">Order ID: {orderId}</p>
        )}

        {/* QRIS placeholder — will show real QR after Midtrans integration */}
        <div className="mb-6 rounded-xl border border-dashed border-navy-200 bg-navy-50 p-8">
          <p className="text-sm text-navy-400">
            QRIS akan muncul di sini setelah integrasi Midtrans aktif.
          </p>
        </div>

        {message && (
          <p className="mb-4 text-sm text-warning-600">{message}</p>
        )}

        <Button onClick={checkStatus} disabled={checking} fullWidth className="gap-2">
          <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
          {checking ? "Mengecek..." : "Cek Status Pembayaran"}
        </Button>

        <Link
          href="/dashboard"
          className="mt-4 inline-block text-xs text-navy-400 hover:text-navy-600"
        >
          Kembali ke Dashboard
        </Link>
      </Card>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-200 border-t-primary-600" />
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
