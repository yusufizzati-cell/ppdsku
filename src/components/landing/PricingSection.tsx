import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const plans = [
  {
    name: "Free Trial",
    price: "Rp 0",
    period: "",
    description: "Coba 10 soal gratis tanpa login.",
    features: [
      { text: "10 soal adaptive", included: true },
      { text: "Overall score", included: true },
      { text: "Radar chart shape", included: true },
      { text: "Detail per topik", included: false },
      { text: "Gap analysis", included: false },
      { text: "Study plan", included: false },
      { text: "Progress tracking", included: false },
    ],
    cta: "Mulai Gratis",
    href: "/onkrad/quiz",
    highlighted: false,
  },
  {
    name: "Pro 3 Bulan",
    price: "Rp 99.000",
    period: "/3 bulan",
    description: "Exam prep short cycle. Hemat 33%.",
    badge: "Populer",
    features: [
      { text: "Unlimited quiz", included: true },
      { text: "Full topic breakdown", included: true },
      { text: "Gap analysis", included: true },
      { text: "Personalized study plan", included: true },
      { text: "Progress tracking", included: true },
      { text: "Review soal salah", included: true },
      { text: "Exam simulation", included: true },
    ],
    cta: "Upgrade ke PRO",
    href: "/upgrade",
    highlighted: true,
  },
  {
    name: "Pro 6 Bulan",
    price: "Rp 149.000",
    period: "/6 bulan",
    description: "Best value untuk persiapan panjang.",
    features: [
      { text: "Semua fitur Pro", included: true },
      { text: "Hemat 49%", included: true },
      { text: "Prioritas support", included: true },
      { text: "Early access fitur baru", included: true },
    ],
    cta: "Upgrade ke PRO",
    href: "/upgrade",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-navy-50 py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Harga Sederhana
          </h2>
          <p className="text-lg text-navy-500">
            Mulai gratis. Upgrade kapan saja untuk full learning intelligence.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              padding="lg"
              className={
                plan.highlighted
                  ? "relative border-primary-500 ring-1 ring-primary-500"
                  : ""
              }
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="pro">{plan.badge}</Badge>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-navy-900">{plan.name}</h3>
                <p className="text-sm text-navy-500">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-navy-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-navy-400">{plan.period}</span>
                )}
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check size={16} className="text-success-600" />
                    ) : (
                      <Lock size={16} className="text-navy-300" />
                    )}
                    <span className={f.included ? "text-navy-700" : "text-navy-400"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  fullWidth
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-navy-400">
          Pembayaran via QRIS — support semua bank & e-wallet Indonesia.
        </p>
      </div>
    </section>
  );
}
