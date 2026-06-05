"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        setError(
          signUpError.message.includes("already")
            ? "Email sudah terdaftar. Silakan masuk."
            : "Registrasi belum berhasil. Coba lagi."
        );
        setLoading(false);
        return;
      }

      // If email confirmation is disabled, session exists → go to dashboard
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Email confirmation enabled
      setSuccess(
        "Akun dibuat. Cek email kamu untuk verifikasi sebelum masuk."
      );
      setLoading(false);
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
            Buat Akun
          </h1>
          <p className="mb-6 text-center text-sm text-navy-500">
            Daftar untuk menyimpan progress dan akses full dashboard.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-danger-50 p-3 text-sm text-danger-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-success-50 p-3 text-sm text-success-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-700">
                Nama
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="dr. Andi Pratama"
                required
                className="h-11 w-full rounded-input border border-navy-200 bg-white px-4 text-sm text-navy-900 outline-none placeholder:text-navy-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

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
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
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
              {loading ? "Memproses..." : "Buat Akun"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
              Masuk
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
