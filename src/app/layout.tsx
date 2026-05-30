import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocaleFromRequest, isRtl } from "@/lib/locale";

const HTML_LANG: Record<string, string> = {
  id: "id",
  ar: "ar",
  eu: "en",
  default: "en",
};

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cosmiclan | High Agency, Raw Output",
  description:
    "Cosmiclan is Gabriel Antony Xaviour's high-agency AI production organism: one orchestrator, a clan of agents, and products built at machine speed.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromRequest();
  return (
    <html
      lang={HTML_LANG[locale] ?? "en"}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
