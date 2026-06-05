import { Brain, Map, BookOpen, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: Brain,
    title: "Adaptive Quiz",
    description:
      "Soal menyesuaikan level kemampuan kamu. Sistem IRT memilih soal yang tepat untuk mengukur gap belajar.",
  },
  {
    icon: Map,
    title: "Topic Mapping",
    description:
      "Peta penguasaan per topik. Tahu persis di mana kelemahan dan kekuatan kamu.",
  },
  {
    icon: BookOpen,
    title: "Study Plan",
    description:
      "Rekomendasi belajar harian berdasarkan gap. Belajar lebih terarah, bukan asal latihan soal.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Pantau perkembangan dari minggu ke minggu. Lihat skor kesiapan naik seiring waktu.",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="bg-navy-50 py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Bukan sekadar bank soal
          </h2>
          <p className="text-lg text-navy-500">
            GPS belajar PPDS — tahu kelemahan, prioritas, dan langkah selanjutnya.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} hover padding="lg" className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                <feature.icon size={24} className="text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-navy-900">
                {feature.title}
              </h3>
              <p className="text-sm text-navy-500">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
