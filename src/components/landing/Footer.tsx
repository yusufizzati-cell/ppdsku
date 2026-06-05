import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy-200 bg-white py-12">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-xs font-bold text-white">K</span>
              </div>
              <span className="font-bold text-navy-900">PPDS Mapper</span>
            </div>
            <p className="text-sm text-navy-500">
              GPS belajar PPDS — adaptive quiz yang mapping pemahaman per topik.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy-900">Produk</h4>
            <ul className="space-y-2 text-sm text-navy-500">
              <li><Link href="#features" className="hover:text-primary-600">Fitur</Link></li>
              <li><Link href="#pricing" className="hover:text-primary-600">Harga</Link></li>
              <li><Link href="#specialties" className="hover:text-primary-600">Spesialisasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy-900">Spesialisasi</h4>
            <ul className="space-y-2 text-sm text-navy-500">
              <li><Link href="/onkrad/quiz" className="hover:text-primary-600">Onkologi Radiasi</Link></li>
              <li><span className="text-navy-300">Anak (Soon)</span></li>
              <li><span className="text-navy-300">Interna (Soon)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-navy-900">Legal</h4>
            <ul className="space-y-2 text-sm text-navy-500">
              <li><span className="text-navy-400">Privacy Policy</span></li>
              <li><span className="text-navy-400">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-navy-100 pt-6 text-center text-xs text-navy-400">
          © 2026 PPDS Knowledge Mapper. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
