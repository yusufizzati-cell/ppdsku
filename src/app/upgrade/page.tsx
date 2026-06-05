import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import { CreatePaymentButton } from "@/components/payment/CreatePaymentButton";
import { PRO_PLANS, type ProPlan } from "@/lib/midtrans";

const features = [
  "Upload soal lebih leluasa",
  "AI extraction + review workflow",
  "Custom quiz dari soal approved",
  "Mistake Book",
  "Learning Insights",
  "AI Study Plan 7 hari",
  "Progress tracking",
  "Prioritas belajar otomatis",
];

const planOrder: ProPlan[] = ["pro_monthly", "pro_3month", "pro_6month"];

export default function UpgradePage() {
  return (
    <main>
      <Navbar />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="pro">PRO</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Upgrade ke PPDS Mapper PRO
            </h1>
            <p className="mt-4 text-lg text-navy-500">
              Unlock full learning loop: upload → AI extract → quiz → mistake book → insights → study plan.
            </p>
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-navy-100 bg-navy-50 p-3">
                <Check size={16} className="flex-shrink-0 text-success-600" />
                <span className="text-sm text-navy-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {planOrder.map((planKey) => {
              const plan = PRO_PLANS[planKey];
              const isPopular = planKey === "pro_3month";
              return (
                <Card
                  key={planKey}
                  padding="lg"
                  className={isPopular ? "border-primary-300 shadow-soft" : ""}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-navy-900">{plan.label}</h2>
                    {isPopular && <Badge variant="pro">Best value</Badge>}
                  </div>
                  <p className="mb-1 text-3xl font-bold text-navy-900">
                    Rp{plan.amount.toLocaleString("id-ID")}
                  </p>
                  <p className="mb-6 text-sm text-navy-500">
                    Aktif {plan.durationDays} hari setelah pembayaran settled.
                  </p>
                  <CreatePaymentButton plan={planKey} />
                </Card>
              );
            })}
          </div>

          <Card padding="md" className="mt-8 bg-primary-50 text-center">
            <p className="text-sm text-navy-600">
              Pembayaran diproses via Midtrans. QRIS, GoPay, dan bank transfer mengikuti metode yang aktif di akun Midtrans.
            </p>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  );
}
