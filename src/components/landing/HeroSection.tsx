import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Brain } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              <Brain size={14} />
              Adaptive Learning Intelligence
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-[56px] lg:leading-[64px]">
              Tau kelemahan kamu sebelum ujian{" "}
              <span className="text-primary-600">CPPDS.</span>
            </h1>
            <p className="mb-2 text-lg text-navy-600">
              Adaptive quiz yang mapping pemahaman per topik.
            </p>
            <p className="mb-8 text-base text-navy-400">
              10 soal gratis — langsung tau gap kamu di mana.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/onkrad/quiz">
                <Button size="lg" className="gap-2">
                  Mulai Tes Gratis
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg">
                  Lihat Fitur
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-navy-400">
              Tanpa login · Tanpa kartu kredit · Langsung mulai
            </p>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-navy-200 bg-navy-50 p-6 shadow-soft">
              {/* Mini dashboard preview */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-danger-500" />
                <div className="h-3 w-3 rounded-full bg-warning-500" />
                <div className="h-3 w-3 rounded-full bg-success-500" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow-card">
                  <p className="text-xs text-navy-400">Skor Kesiapan</p>
                  <p className="text-2xl font-bold text-navy-900">72/100</p>
                  <p className="text-xs text-success-600">+8 minggu ini</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-card">
                  <p className="text-xs text-navy-400">Topik Lemah</p>
                  <p className="text-sm font-semibold text-danger-600">Radiobiologi</p>
                  <p className="text-xs text-navy-400">38% penguasaan</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-card">
                  <p className="text-xs text-navy-400">Akurasi</p>
                  <p className="text-2xl font-bold text-navy-900">64%</p>
                  <p className="text-xs text-primary-600">+6% minggu ini</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-card">
                  <p className="text-xs text-navy-400">Rekomendasi</p>
                  <p className="text-sm font-semibold text-navy-700">Quiz Radiobiologi</p>
                  <p className="text-xs text-warning-600">Prioritas tinggi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
