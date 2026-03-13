import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Базовый URL для правильной работы ссылок на картинки
  metadataBase: new URL('https://mektepmebel.kz'),

  title: {
    template: "%s | Mektep Mebel",
    default: "Школьная мебель в Алматы | MektepMebel.kz",
  },
  
  description: "Качественные школьные парты, стулья и мебель для учебных заведений. Производство и доставка по Алматы и всему Казахстану. Каталог 2026.",
  // Добавь вот этот блок:

  verification: {
    google: "ac3HwWJbcy0OVJLnP_1dXNZl0MRZMjJIiBfhgg-Ve9k",   
    yandex: "b532cb4728ed5701",   
  },

  keywords: [
    "школьная мебель",
    "школьная мебель алматы",
    "школьная мебель казахстан",
    "школьная парта",
    "купить парту алматы",
    "школьные стулья",
    "мебель для школы",
    "оборудование классов",
    "mektep mebel",
    "mektepmebel.kz"
  ],

  openGraph: {
    title: "Школьная мебель в Казахстане | Mektep Mebel",
    description: "Парты, стулья и оснащение школ под ключ. Доставка по Казахстану.",
    url: "https://mektepmebel.kz",
    siteName: "MektepMebel.kz",
    images: [
      {
        url: "/og-image.jpg", // Не забудь положить картинку в папку public
        width: 1200,
        height: 630,
        alt: "Школьная мебель Mektep Mebel",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },

  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
