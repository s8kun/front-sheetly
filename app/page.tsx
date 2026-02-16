"use client";

import { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "900"],
});

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // لضمان UX جبار ومنع الوميض

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      const token = Cookies.get("token");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
      setIsAuthLoading(false); // انتهى التحقق
    };

    checkAuth();
  }, []);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <div
      dir="rtl"
      className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden ${cairo.className}`}
    >
      {/* --- خلفية جمالية --- */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-pulse" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-sky-200 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-pulse delay-700" />

      {/* --- الشريط العلوي (Navbar) --- */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-700/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              ش
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              شيتاتي
            </h1>
          </Link>

          {/* أزرار الإجراءات - UX محسّن */}
          <div className="flex gap-2 md:gap-4 items-center h-10">
            <AnimatePresence mode="wait">
              {isAuthLoading ? (
                // Skeleton بسيط لمنع القفزة البصرية
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-20 h-8 bg-slate-100 rounded-full animate-pulse"></div>
                  <div className="w-24 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                </motion.div>
              ) : user ? (
                <motion.div
                  key="user-nav"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 md:gap-3"
                >
                  {isAdmin && (
                    <Link
                      href="/subjects"
                      className="text-slate-600 dark:text-slate-300 text-xs font-bold hover:text-blue-600 px-2 transition-colors"
                    >
                      تصفح المواد
                    </Link>
                  )}
                  <Link
                    href={isAdmin ? "/admin/dashboard" : "/subjects"}
                    className={`${isAdmin ? "bg-slate-900 shadow-slate-200" : "bg-blue-600 shadow-blue-100"} text-white px-4 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm hover:scale-105 transition-all shadow-lg`}
                  >
                    {isAdmin ? "لوحة التحكم" : "عرض المواد"}
                  </Link>
                  <button
                    onClick={() => {
                      Cookies.remove("token");
                      localStorage.removeItem("user");
                      window.location.reload();
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors text-[10px] md:text-xs font-bold mr-1"
                  >
                    خروج
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="guest-nav"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 md:gap-4"
                >
                  <Link
                    href="/login"
                    className="text-slate-600 dark:text-slate-300 text-sm font-bold hover:text-blue-600 px-2"
                  >
                    دخول
                  </Link>
                  <Link
                    href="/register"
                    className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold shadow-lg text-sm hover:bg-slate-800 transition-all"
                  >
                    انضم إلينا
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* --- المحتوى الرئيسي --- */}
      <main className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          النسخة التجريبية متاحة الآن
        </motion.div>

        <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight max-w-4xl">
          شيتاتك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500">
            قعدن في مكان واحد
          </span>
        </h2>

        <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed">
          سجل وخش نزل كل شيتاتك وامتحانات المواد السابقة وهذا كله في مكان واحد
          بس
        </p>

        <div className="h-16 flex justify-center w-full">
          <AnimatePresence mode="wait">
            {!isAuthLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full flex justify-center px-6"
              >
                <Link
                  href={
                    user
                      ? isAdmin
                        ? "/admin/dashboard"
                        : "/subjects"
                      : "/register"
                  }
                  className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white px-12 py-4 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto shadow-xl"
                >
                  {user
                    ? isAdmin
                      ? "لوحة التحكم"
                      : "ابدأ تصفح المواد"
                    : "ابدأ الآن مجاناً"}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 opacity-40 text-sm text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
          تم التطوير بواسطة الطالب عبد الله الفرجاني
        </div>
      </main>
    </div>
  );
}
