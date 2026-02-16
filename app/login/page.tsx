"use client";

import React, { useState } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Home, LogIn } from "lucide-react";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export default function Login() {
  const router = useRouter();

  // States
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const fullEmail = `itstd.${studentId}@uob.edu.ly`;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: fullEmail,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.set("token", data.access_token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        if (res.status === 429) {
          setError(
            "لقد تجاوزت عدد المحاولات المسموح بها. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.",
          );
          return;
        }
        if (res.status === 403) {
          // الحساب غير مؤكد، التوجيه لصفحة التحقق
          router.push(
            `/register/verify?email=${encodeURIComponent(fullEmail)}&resend=true`,
          );
          return;
        }

        if (res.status === 401) {
          setError(
            "بيانات الدخول غير صحيحة، يرجى التأكد من الرقم السري ورقم القيد.",
          );
        } else if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setError(
            Array.isArray(firstError)
              ? firstError[0]
              : "حدث خطأ في البيانات المدخلة",
          );
        } else {
          setError(data.message || "حدث خطأ غير متوقع، حاول مرة أخرى.");
        }
      }
    } catch (err) {
      setError("فشل الاتصال بالخادم، تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex md:items-center md:justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden ${cairo.className}`}
      dir="rtl"
    >
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70 delay-700" />

      <nav className="absolute top-6 right-6 z-50">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 dark:border-slate-700/60 ">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-blue-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5 ml-1.5" />
              الرئيسية
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 text-slate-400">/</span>
              <span className="inline-flex items-center text-xs font-bold text-blue-600">
                <LogIn className="w-3.5 h-3.5 ml-1.5" />
                الدخول
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="w-full h-screen md:h-auto md:max-w-md bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl md:rounded-3xl  md:border md:border-slate-200/70 dark:border-slate-700/60 flex flex-col px-6 pt-24 pb-10 md:py-10 md:px-10 relative z-10">
        <div className="w-full mx-auto flex flex-col justify-center h-full md:h-auto">
          <div className="text-center mb-10">
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl   mb-6">
              ش
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              مرحباً بعودتك
            </h2>
            <p className="text-slate-500 dark:text-slate-300 text-sm mt-3 font-medium">
              سجل دخولك لمتابعة جداولك الدراسية
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                البريد الجامعي
              </label>
              <div
                className={`flex items-center w-full h-14 rounded-2xl border ${error ? "border-red-300" : "border-slate-300 dark:border-slate-700"} bg-white/70 dark:bg-slate-900/60 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden  transition-all`}
                dir="ltr"
              >
                <span className="shrink-0 pl-3 pr-1 text-slate-500 dark:text-slate-400 font-mono text-xs md:text-sm border-r border-slate-200 dark:border-slate-700 select-none h-full flex items-center bg-slate-50/50 dark:bg-slate-800/60">
                  itstd.
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 h-full border-0 bg-transparent text-center text-slate-900 dark:text-slate-100 placeholder:text-slate-300 focus:ring-0 text-lg font-mono tracking-widest outline-none min-w-[60px]"
                />
                <span className="shrink-0 pr-3 pl-1 text-slate-500 dark:text-slate-400 font-mono text-[10px] sm:text-xs md:text-sm border-l border-slate-200 dark:border-slate-700 select-none h-full flex items-center bg-slate-50/50 dark:bg-slate-800/60">
                  @uob.edu.ly
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`block w-full h-14 rounded-2xl border ${error ? "border-red-300" : "border-slate-300 dark:border-slate-700"} bg-white/70 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900  focus:border-blue-500 focus:ring-blue-500 text-lg transition-all px-4 text-slate-900 dark:text-slate-100`}
              />
              <div className="mt-2 text-left">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg   hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-bold text-blue-600 hover:underline"
              >
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
