import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const TajawalFont = Tajawal({
    weight: ["400","500","700","800"],
    variable: "--font-tajawal",
    subsets: ["arabic"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "شيتاتي - منصة الشيتات الدراسية الأولى في ليبيا",
  description: "أكبر منصة لتجميع وتنظيم الشيتات والامتحانات لطلاب الجامعات الليبية. حمل شيتاتك، شارك مع زملائك، وضمن نجاحك مع شيتاتي.",
  keywords: ["شيتاتي", "شيتات ليبيا", "امتحانات", "جامعة بنغازي", "ly", "sheetly", "شيتات ly", "هندسة برمجيات", "IT", "UOB", "منهج ليبي"],
  authors: [{ name: "Abdullah Elferjani", url: "https://github.com/s8kun" }],
  openGraph: {
    title: "شيتاتي - بوابتك للنجاح",
    description: "كل شيتاتك في مكان واحد. منصة شيتاتي تسهل عليك الدراسة والمشاركة.",
    type: "website",
    locale: "ar_LY",
  },
  icons: {
    icon: '/favicon.ico', // تأكد من وجود أيقونة
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${TajawalFont.variable} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50`}
      >
        <div className="flex-1 w-full">
            {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
