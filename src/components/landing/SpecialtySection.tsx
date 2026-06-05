import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stethoscope, Baby, Heart, Scissors, Eye } from "lucide-react";

const specialties = [
  {
    slug: "onkrad",
    name: "Onkologi Radiasi",
    icon: Stethoscope,
    status: "active" as const,
    questionCount: 790,
    description: "Radiobiologi, staging, teknik RT, farmakologi, dan lainnya.",
  },
  {
    slug: "anak",
    name: "Ilmu Kesehatan Anak",
    icon: Baby,
    status: "coming-soon" as const,
    questionCount: null,
    description: "Segera hadir.",
  },
  {
    slug: "interna",
    name: "Ilmu Penyakit Dalam",
    icon: Heart,
    status: "coming-soon" as const,
    questionCount: null,
    description: "Segera hadir.",
  },
  {
    slug: "bedah",
    name: "Ilmu Bedah",
    icon: Scissors,
    status: "coming-soon" as const,
    questionCount: null,
    description: "Segera hadir.",
  },
  {
    slug: "mata",
    name: "Ilmu Kesehatan Mata",
    icon: Eye,
    status: "coming-soon" as const,
    questionCount: null,
    description: "Segera hadir.",
  },
];

export function SpecialtySection() {
  return (
    <section id="specialties" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Pilih Spesialisasi
          </h2>
          <p className="text-lg text-navy-500">
            Mulai mapping kelemahan kamu di prodi yang dituju.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((spec) => (
            <Card key={spec.slug} hover padding="lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <spec.icon size={20} className="text-primary-600" />
                </div>
                <Badge variant={spec.status === "active" ? "success" : "coming-soon"}>
                  {spec.status === "active" ? "Aktif" : "Coming Soon"}
                </Badge>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-navy-900">{spec.name}</h3>
              <p className="mb-4 text-sm text-navy-500">{spec.description}</p>
              {spec.status === "active" ? (
                <>
                  <p className="mb-3 text-xs text-navy-400">
                    {spec.questionCount} soal tersedia
                  </p>
                  <Link href={`/${spec.slug}/quiz`}>
                    <Button fullWidth>Mulai Tes Gratis</Button>
                  </Link>
                </>
              ) : (
                <Button variant="secondary" fullWidth disabled>
                  Segera Hadir
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
