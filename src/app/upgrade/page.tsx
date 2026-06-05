import { Navbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";

export default function UpgradePage() {
  return (
    <main>
      <Navbar />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Upgrade ke PRO
          </h1>
          <p className="mb-8 text-lg text-navy-500">
            Unlock full learning intelligence — tahu kelemahan, prioritas belajar, dan langkah selanjutnya.
          </p>
          <Card padding="lg" className="mb-8 text-left">
            <h3 className="mb-4 text-lg font-semibold text-navy-900">
              Apa yang kamu dapatkan dengan PRO:
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Full topic breakdown dengan persentase",
                "Gap analysis detail per topik",
                "Personalized study plan",
                "Progress tracking mingguan",
                "Review soal salah dengan explanation",
                "Unlimited quiz sessions",
                "Exam simulation mode",
                "Rekomendasi belajar harian",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check size={16} className="text-success-600 flex-shrink-0" />
                  <span className="text-sm text-navy-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card padding="lg" className="text-left">
            <h3 className="mb-3 text-lg font-semibold text-navy-900">
              Pembayaran via QRIS
            </h3>
            <p className="mb-4 text-sm text-navy-500">
              Dukung semua bank dan e-wallet Indonesia. Scan, bayar, langsung aktif.
            </p>
            <div className="rounded-xl bg-navy-50 p-6 text-center">
              <p className="text-sm text-navy-400">
                Integrasi pembayaran QRIS akan segera tersedia.
              </p>
              <p className="mt-2 text-xs text-navy-300">
                Saat ini dalam tahap pengembangan. Hubungi kami untuk early access.
              </p>
            </div>
          </Card>
        </div>
      </section>
      <PricingSection />
      <Footer />
    </main>
  );
}
