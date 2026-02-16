"use client";

import React, { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    console.log(
      "Reset Password Params - Token:",
      t ? "Found" : "Missing",
      "Email:",
      e,
    );
    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token || !email) {
      setError(
        "رابط غير صالح. يرجى التأكد من الضغط على الرابط الصحيح في بريدك الإلكتروني.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة.");
      return;
    }

    setIsLoading(true);
    console.log("Attempting to reset password for:", email);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation: confirmPassword,
          }),
        },
      );

      const data = await res.json();
      console.log("Reset Response Data:", data);

      if (res.ok) {
        setMessage("تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(
          data.message ||
            "فشل في إعادة تعيين كلمة المرور. قد يكون الرابط قد انتهى.",
        );
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError("فشل الاتصال بالخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex md:items-center md:justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden ${cairo.className}`}
      dir="rtl"
    >
      <div className="hidden md:block absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70" />
      <div className="hidden md:block absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-sky-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70 delay-1000" />

      <nav className="absolute top-6 right-6 z-50">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 dark:border-slate-700/60 ">
          <li>
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
                <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
                إعادة تعيين كلمة المرور
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="w-full h-screen md:h-auto md:max-w-md bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl md:rounded-3xl  md:border md:border-slate-200/70 dark:border-slate-700/60 flex flex-col px-6 pt-24 pb-10 md:py-10 md:px-10 relative z-10">
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl  mb-6">
            ش
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            كلمة مرور جديدة
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-sm mt-3 font-medium">
            أدخل كلمة المرور الجديدة لحسابك
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-medium text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="block w-full h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900  focus:border-blue-500 focus:ring-blue-500 text-lg transition-all px-4 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="block w-full h-14 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900  focus:border-blue-500 focus:ring-blue-500 text-lg transition-all px-4 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg   hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
}
