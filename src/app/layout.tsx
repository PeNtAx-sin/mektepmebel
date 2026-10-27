import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Базовый адрес: из него строятся canonical и ссылки на картинки
  metadataBase: new URL(site.url),
  applicationName: site.name,

  title: {
    template: `%s | ${site.name}`,
    default: "Школьная мебель и пластиковые стулья | Mektep Mebel",
  },
  description:
    "Школьные парты и стулья, пластиковые стулья для дома, кафе и офиса, мебель для кабинетов химии и физики. Доставка по Казахстану.",

  verification: {
    google: "ac3HwWJbcy0OVJLnP_1dXNZl0MRZMjJIiBfhgg-Ve9k",
    yandex: "b532cb4728ed5701",
  },

  // Каждая страница задаёт свои openGraph и canonical через pageMetadata() из lib/seo.ts;
  // картинка по умолчанию — src/app/opengraph-image.tsx
  openGraph: {
    siteName: site.name,
    locale: "ru_RU",
    type: "website",
  },
  twitter: { card: "summary_large_image" },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}