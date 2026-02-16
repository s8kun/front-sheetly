"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cairo } from "next/font/google";
import { FileQuestion, Home, ArrowRight } from "lucide-react";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "900"],
});

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className={`${cairo.className} min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6 relative overflow-hidden`}
    >
      {/* الخلفية الجمالية */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          {/* رقم الـ 404 بتصميم مميز */}
          <h1 className="text-[12rem] md:text-[16rem] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
            404
          </h1>

          {/* أيقونة عائمة */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white/90 dark:bg-slate-900/80 p-6 rounded-[2.5rem] shadow-2xl shadow-blue-200 border border-slate-200 dark:border-slate-700 relative z-10">
              <FileQuestion
                className="w-20 h-20 text-blue-600"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">
            أووبس! ضعت بين الشيتات؟ 📄
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            الصفحة اللي تدور عليها شكلها مش قاعدة، أو يمكن انتقلت لمكان ثاني. لا
            تشغل بالك، تقدر ترجع للرئيسية وتكمل دراستك.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-200 group"
            >
              <Home className="w-5 h-5" />
              <span>الرجوع للرئيسية</span>
            </Link>

            <Link
              href="/subjects"
              className="flex items-center gap-2 px-8 py-4 bg-white/90 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all group"
            >
              <span>تصفح المواد</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* نص سفلي بسيط */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-16 text-sm text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest"
        >
          Sheetly • Lost in Space
        </motion.p>
      </div>
    </div>
  );
}
