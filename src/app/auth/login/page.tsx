"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Login belum berhasil. Periksa email dan password kamu.");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Pastikan koneksi internet stabil.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-xl font-bold text-navy-900">
              PPDS <span className="text-primary-600">Mapper</span>
            </span>
          </Link>
        </div>

        <Card padding="lg">
          <h1 className="mb-2 text-center text-2xl font-bold text-navy-900">
            Masuk
          </h1>
          <p className="mb-6 text-center text-sm text-navy-500">
            Masuk untuk mengakses dashboard dan progress kamu.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-danger-50 p-3 text-sm text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dokter@email.com"
                required
                className="h-11 w-full rounded-input border border-navy-200 bg-white px-4 text-sm text-navy-900 outline-none placeholder:text-navy-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 w-full rounded-input border border-navy-200 bg-white px-4 pr-10 text-sm text-navy-900 outline-none placeholder:text-navy-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-700">
              Daftar
            </Link>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-navy-400">
          <Link href="/" className="hover:text-navy-600">
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-200 border-t-primary-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
