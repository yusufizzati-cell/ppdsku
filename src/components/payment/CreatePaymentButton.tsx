"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ProPlan } from "@/lib/midtrans";

export function CreatePaymentButton({ plan }: { plan: ProPlan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPayment() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/midtrans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message ?? "Gagal membuat pembayaran.");
      }
      window.location.href = json.data.redirect_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pembayaran.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={createPayment} disabled={loading} fullWidth>
        {loading ? "Membuat QRIS..." : "Bayar via QRIS / Midtrans"}
      </Button>
      {error && <p className="text-xs text-danger-700">{error}</p>}
    </div>
  );
}
