import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerLocale, getServerT } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/providers/i18n-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const t = getServerT();
  return {
    title: `Facturi — ${t("landing.heroTitle")}`,
    description: t("landing.heroSubtitle"),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getServerLocale();
  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
