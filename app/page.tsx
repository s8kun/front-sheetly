"use client";

import { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  name: string;
  role: string;
}

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "900"],
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedUser = Cookies.get("user");
      const token = Cookies.get("token");
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {}
      }
      setIsAuthLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      dir="rtl"
      className={`page-shell ${cairo.className} min-h-screen w-full flex flex-col bg-background text-foreground overflow-x-hidden`}
    >
      <nav className="bg-white border-b border-border w-full">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-foreground"
          >
            <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center">
              ش
            </span>
            شيتاتي
          </Link>

          <AnimatePresence mode="wait">
            {isAuthLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted"
              >
                جاري التحقق...
              </motion.div>
            ) : user ? (
              <motion.div
                key="user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Link
                  href="/subjects"
                  className="btn-primary text-sm inline-flex items-center"
                >
                  المواد
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="btn-ghost text-sm inline-flex items-center"
                  >
                    لوحة التحكم
                  </Link>
                )}
                <button
                  onClick={() => {
                    Cookies.remove("token");
                    Cookies.remove("user");
                    window.location.reload();
                  }}
                  className="btn-ghost text-sm"
                >
                  تسجيل خروج
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="guest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Link href="/login" className="btn-ghost text-sm">
                  دخول
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  حساب جديد
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="flex-1 w-full flex items-center justify-center px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel w-full max-w-3xl p-7 md:p-10 text-center mx-auto"
        >
          <p className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-[#eaf2ff] text-primary border border-[#c9dcff]">
            بوابة طلاب تقنية المعلومات
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-black text-foreground leading-tight">
            كل شيتاتك في مكان واحد
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted max-w-2xl mx-auto">
            سجل دخولك، ابحث على المادة، وحمل الشيتات والامتحانات القديمة بسهولة
            وبطريقة واضحة لأي طالب.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <Link
                  href="/subjects"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  ادخل للمواد
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="btn-ghost inline-flex items-center justify-center"
                  >
                    افتح لوحة التحكم
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="btn-ghost inline-flex items-center justify-center"
                >
                  تسجيل جديد
                </Link>
              </>
            )}
          </div>

          {/* {!user && (
            <div className="mt-4 text-sm text-muted flex flex-wrap items-center justify-center gap-4">
              <Link href="/forgot-password" className="hover:text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
              <Link href="/register" className="hover:text-primary hover:underline">
                عندك رمز OTP؟ كمل التسجيل
              </Link>
            </div>
          )}

          {!user && (
            <p className="mt-5 text-xs text-muted">
              ملاحظة: صفحة المواد محمية ولا تفتح إلا بعد تسجيل الدخول.
            </p>
          )} */}
        </motion.section>
      </main>
    </div>
  );
}
