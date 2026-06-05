import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PPDS Knowledge Mapper — GPS Belajar PPDS",
  description:
    "Adaptive quiz yang mapping pemahaman per topik. Tau kelemahan kamu sebelum ujian CPPDS.",
  keywords: ["PPDS", "CPPDS", "adaptive quiz", "knowledge mapper", "onkologi radiasi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
