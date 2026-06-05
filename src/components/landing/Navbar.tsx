"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-navy-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-lg font-bold text-navy-900">
              PPDS <span className="text-primary-600">Mapper</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-navy-600 hover:text-navy-900">
              Fitur
            </Link>
            <Link href="#specialties" className="text-sm text-navy-600 hover:text-navy-900">
              Spesialisasi
            </Link>
            <Link href="#pricing" className="text-sm text-navy-600 hover:text-navy-900">
              Harga
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-navy-700 hover:text-primary-600">
              Masuk
            </Link>
            <Link href="/onkrad/quiz">
              <Button size="sm">Mulai Tes Gratis</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-navy-600"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-navy-100 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="#features" className="px-2 py-2 text-sm text-navy-600">
                Fitur
              </Link>
              <Link href="#specialties" className="px-2 py-2 text-sm text-navy-600">
                Spesialisasi
              </Link>
              <Link href="#pricing" className="px-2 py-2 text-sm text-navy-600">
                Harga
              </Link>
              <Link href="/auth/login" className="px-2 py-2 text-sm font-medium text-navy-700">
                Masuk
              </Link>
              <Link href="/onkrad/quiz">
                <Button fullWidth>Mulai Tes Gratis</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
