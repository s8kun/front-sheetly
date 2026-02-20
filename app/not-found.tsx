"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { FileQuestion, Home } from "lucide-react";

/**
 * مكون صفحة غير موجودة (NotFound - 404).
 *
 * يتم عرض هذه الصفحة تلقائياً بواسطة Next.js عندما يحاول المستخدم زيارة
 * مسار غير موجود في التطبيق أو عند استدعاء دالة `notFound()`.
 * توفر الصفحة أزراراً سريعة للعودة للرئيسية أو تصفح المواد لتوجيه المستخدم المفقود.
 *
 * @returns {JSX.Element} واجهة خطأ 404 بتصميم متناسق مع التطبيق.
 */
export default function NotFound() {
  return (
    <div dir="rtl" className="page-shell flex items-center justify-center p-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel max-w-xl w-full p-8 text-center"
      >
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-primary">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-foreground">404</h1>
        <h2 className="text-xl font-bold mt-3">الصفحة غير موجودة</h2>
        <p className="text-muted mt-2">الرابط هذا غير صحيح أو الصفحة انحذفت</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            الرجوع للرئيسية
          </Link>
          <Link
            href="/subjects"
            className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center"
          >
            تصفح المواد
          </Link>
        </div>
      </m.div>
    </div>
  );
}
