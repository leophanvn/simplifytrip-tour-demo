import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonProvider } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: { default: "Tour du lịch – Simplify Trip (demo)", template: "%s | Simplify Trip (demo)" },
  description: "Bản demo giao diện dịch vụ Tour trên simplifytrip.com.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#224900" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-dvh">
        <ComingSoonProvider>
          <Header />
          {children}
          <Footer />
        </ComingSoonProvider>
      </body>
    </html>
  );
}
