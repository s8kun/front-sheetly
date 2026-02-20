import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import FramerProvider from "@/components/FramerProvider";
import { ToastProvider } from "@/components/ToastProvider";

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "شيتاتي - منصة الشيتات الدراسية الأولى في ليبيا",
  description:
    "أكبر منصة لتجميع وتنظيم الشيتات والامتحانات لطلاب الجامعات الليبية. حمل شيتاتك، شارك مع زملائك، وضمن نجاحك مع شيتاتي.",
  keywords: [
    "شيتاتي",
    "شيتات ليبيا",
    "امتحانات",
    "جامعة بنغازي",
    "ly",
    "sheetly",
    "شيتات ly",
    "هندسة برمجيات",
    "IT",
    "UOB",
    "منهج ليبي",
  ],
  authors: [{ name: "Abdullah Elferjani", url: "https://github.com/s8kun" }],
  openGraph: {
    title: "شيتاتي - بوابتك للنجاح",
    description:
      "كل شيتاتك في مكان واحد. منصة شيتاتي تسهل عليك الدراسة والمشاركة.",
    type: "website",
    locale: "ar_LY",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * المكون الجذري للتطبيق (RootLayout).
 *
 * الغلاف الأساسي الذي يحيط بجميع صفحات التطبيق بنظام الـ App Router في Next.js.
 * يهتم بإنشاء الـ `<html>` و `<body>` وتطبيق خط "تجوال" (Tajawal) باللغة العربية.
 * يضمن أيضاً إضافة مكون `ToastProvider` لعرض الإشعارات في أي مكان، ومكون `Footer`
 * للظهور في أسفل كل صفحة.
 *
 * @param {Object} props - خصائص المكون (الأبناء `children`).
 * @returns {JSX.Element} هيكل HTML الرئيسي للتطبيق.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} antialiased min-h-screen flex flex-col page-shell`}
      >
        <FramerProvider>
          <ToastProvider>
            <div className="flex-1 w-full">{children}</div>
            <Footer />
          </ToastProvider>
        </FramerProvider>
      </body>
    </html>
  );
}
