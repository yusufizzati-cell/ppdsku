import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="text-center">
        <p className="mb-2 text-6xl font-bold text-navy-200">404</p>
        <h1 className="mb-2 text-xl font-bold text-navy-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mb-6 text-sm text-navy-500">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
          <Link href="/onkrad/quiz">
            <Button variant="secondary">Mulai Tes Gratis</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
