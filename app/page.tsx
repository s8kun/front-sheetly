"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { m, AnimatePresence } from "framer-motion";

import {
  Menu,
  X,
  BookOpen,
  UserPlus,
  LogIn,
  ArrowRightLeft,
} from "lucide-react";

interface User {
  name: string;
  role: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    const savedUser = Cookies.get("user");
    const token = Cookies.get("token");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    setIsAuthLoading(false);
  }, []);

  return (
    <div
      dir="rtl"
      className="page-shell min-h-screen w-full flex flex-col bg-background text-foreground overflow-x-hidden"
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex! items-center gap-4">
            <Link
              href="/freshmen-guide"
              className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              دليل الطلبة الجدد
            </Link>

            <Link
              href="/transfer-guide"
              className="text-sm font-bold text-muted hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowRightLeft className="w-4 h-4" />
              شروط الانتقال والمعادلة
            </Link>

            <div className="w-px h-6 bg-border mx-1"></div>

            <AnimatePresence mode="wait">
              {isAuthLoading ? (
                <m.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted"
                >
                  جاري التحقق...
                </m.div>
              ) : user ? (
                <m.div
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
                    className="btn-ghost text-sm text-red-500 hover:bg-red-50"
                  >
                    تسجيل خروج
                  </button>
                </m.div>
              ) : (
                <m.div
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
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-white overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                <Link
                  href="/freshmen-guide"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f0f6ff] text-primary font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5" />
                  دليل الطلبة الجدد
                </Link>

                <Link
                  href="/transfer-guide"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f0f6ff] text-primary font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  شروط الانتقال والمعادلة
                </Link>

                <div className="h-px bg-border my-1"></div>

                {!isAuthLoading &&
                  (user ? (
                    <>
                      <Link
                        href="/subjects"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-foreground font-semibold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        المواد
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-foreground font-semibold"
                          onClick={() => setIsMobileMenuOpen(false)}
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
                        className="w-full text-right flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold"
                      >
                        تسجيل خروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-foreground font-semibold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5 text-slate-400" />
                        تسجيل الدخول
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-foreground font-semibold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserPlus className="w-5 h-5 text-slate-400" />
                        إنشاء حساب جديد
                      </Link>
                    </>
                  ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 w-full flex items-center justify-center px-4 py-8">
        <m.section
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
        </m.section>
      </main>
    </div>
  );
}
