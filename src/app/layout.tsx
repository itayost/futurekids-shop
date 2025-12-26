import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import JsonLd from "./JsonLd";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kidcode.org.il'),
  title: "KidCode - ספרי מדע וטכנולוגיה לילדים",
  description: "סדרת ספרי KidCode מנגישה לילדים את עולם הטכנולוגיה - בינה מלאכותית, הצפנה ואלגוריתמים. מאת ד\"ר סתיו אלבר, מהנדסת תוכנה ב-Google ומרצה בטכניון.",
  keywords: ["ספרי ילדים", "מדע לילדים", "בינה מלאכותית", "הצפנה", "אלגוריתמים", "ד\"ר סתיו אלבר", "KidCode"],
  authors: [{ name: "ד\"ר סתיו אלבר" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "KidCode - ספרי מדע וטכנולוגיה לילדים",
    description: "סדרת ספרי KidCode מנגישה לילדים את עולם הטכנולוגיה - בינה מלאכותית, הצפנה ואלגוריתמים. מאת ד\"ר סתיו אלבר, מהנדסת תוכנה ב-Google ומרצה בטכניון.",
    url: "https://www.kidcode.org.il",
    siteName: "KidCode",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KidCode - ספרי מדע וטכנולוגיה לילדים",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KidCode - ספרי מדע וטכנולוגיה לילדים",
    description: "סדרת ספרי KidCode מנגישה לילדים את עולם הטכנולוגיה - בינה מלאכותית, הצפנה ואלגוריתמים. מאת ד\"ר סתיו אלבר, מהנדסת תוכנה ב-Google ומרצה בטכניון.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <JsonLd />
        <CartProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Cart />
        </CartProvider>
      </body>
    </html>
  );
}
