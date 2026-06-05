import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Clock, ArrowRight } from "lucide-react";

interface ComingSoonPageProps {
  specialty: string;
}

export function ComingSoonPage({ specialty }: ComingSoonPageProps) {
  return (
    <main>
      <Navbar />
      <section className="flex min-h-[60vh] items-center justify-center bg-navy-50 px-4 py-16">
        <Card padding="lg" className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100">
            <Clock size={28} className="text-navy-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-navy-900">{specialty}</h1>
          <p className="mb-6 text-sm text-navy-500">
            Prodi ini belum tersedia. Kami sedang menyiapkan bank soal dan mapping topiknya.
          </p>
          <div className="space-y-3">
            <Button fullWidth disabled>
              Beritahu Saya Saat Tersedia
            </Button>
            <Link href="/onkrad/quiz">
              <Button variant="secondary" fullWidth className="gap-2">
                Coba Demo Onkologi Radiasi
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}
