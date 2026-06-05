"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Map,
  Lightbulb,
  RotateCcw,
  Clock,
  CalendarCheck,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Soal", icon: UploadCloud },
  { href: "/uploads", label: "Soal Saya", icon: BookOpen },
  { href: "/custom-results", label: "Hasil Upload", icon: Clock },
  { href: "/dashboard/topic-map", label: "Peta Topik", icon: Map },
  { href: "/dashboard/recommendations", label: "Rekomendasi", icon: Lightbulb },
  { href: "/dashboard/review", label: "Review Salah", icon: RotateCcw },
  { href: "/dashboard/history", label: "Riwayat", icon: Clock },
  { href: "/dashboard/study-plan", label: "Study Plan", icon: CalendarCheck },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform border-r border-navy-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-navy-100 px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="font-bold text-navy-900">
              PPDS <span className="text-primary-600">Mapper</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-navy-400"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-navy-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-700"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-200 bg-white/90 px-4 backdrop-blur-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-navy-600"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-navy-500">Onkologi Radiasi</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/onkrad/quiz">
              <button className="hidden sm:inline-flex items-center gap-2 rounded-button bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                <BookOpen size={16} />
                Mulai Quiz
              </button>
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
