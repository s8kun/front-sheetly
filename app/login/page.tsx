"use client";

import React, { useState } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { toArabicApiError } from "@/lib/api-errors";

interface LoginFormValues {
  studentId: string;
  password: string;
}

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

/**
 * مكون صفحة تسجيل الدخول (Login).
 *
 * يتعامل مع عملية مصادقة المستخدمين (الطلاب).
 * يتم الدخول باستخدام رقم القيد الجامعي الذي يتم تحويله لبريد إلكتروني
 * (itstd.[ID]@uob.edu.ly) بالإضافة إلى كلمة المرور.
 *
 * الحالة (State):
 * - `isLoading`: لتعطيل النموذج والزر أثناء انتظار رد الخادم.
 * - `error`: لعرض رسائل الأخطاء (أخطاء التحقق أو أخطاء الخادم) للمستخدم.
 *
 * سير العمل (Flow):
 * 1. يقوم النموذج بالتحقق من رقم القيد وطول كلمة المرور محلياً.
 * 2. عند الإرسال، يتم بناء البريد الإلكتروني وإرسال البيانات لنقطة `/login`.
 * 3. في حالة النجاح، يتم حفظ الـ `token` وبيانات المستخدم في الـ Cookies ثم التوجيه للصفحة الرئيسية.
 * 4. يعالج أخطاء خاصة مثل 403 (بريد غير مفعل) و 429 (تجاوز حد المحاولات).
 *
 * @returns {JSX.Element} واجهة صفحة تسجيل الدخول.
 */
export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      studentId: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError("");
    setIsLoading(true);

    const fullEmail = `itstd.${values.studentId.trim()}@uob.edu.ly`;

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
          password: values.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.set("token", data.access_token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("user", JSON.stringify(data.user), {
          expires: 7,
          sameSite: "strict",
          secure: true,
        });
        router.push("/");
      } else {
        if (res.status === 429) {
          setError("وصلت للحد المسموح من المحاولات. جرب بعد دقيقة.");
          return;
        }
        if (res.status === 403) {
          router.push(
            `/register/verify?email=${encodeURIComponent(fullEmail)}&resend=true`,
          );
          return;
        }

        if (res.status === 401) {
          setError("البيانات غير صحيحة. تأكد من رقم القيد وكلمة المرور.");
        } else if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setError(
            toArabicApiError(
              Array.isArray(firstError) ? firstError[0] : firstError,
              "فيه خطأ في البيانات.",
            ),
          );
        } else {
          setError(toArabicApiError(data.message, "صار خطأ غير متوقع."));
        }
      }
    } catch {
      setError("فشل الاتصال بالخادم. تأكد من النت.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className={`page-shell ${cairo.className}`}>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="panel w-full max-w-md p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black">تسجيل الدخول</h1>
            <p className="text-sm text-muted mt-2">
              ادخل بياناتك للدخول إلى حسابك
            </p>
          </div>

          {error && <div className="status-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold">
                البريد الجامعي
              </label>
              <div
                className="field flex items-center p-0 overflow-hidden"
                dir="ltr"
              >
                <span className="px-3 text-slate-500 border-e border-border bg-slate-50 h-full inline-flex items-center">
                  itstd.
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000"
                  {...register("studentId", {
                    required: "الحقل هذا ضروري",
                    pattern: {
                      value: /^\d+$/,
                      message: "اكتب رقم القيد صح (أرقام بس)",
                    },
                    minLength: {
                      value: 4,
                      message: "رقم القيد قصير واجد",
                    },
                    onChange: () => setError(""),
                  })}
                  disabled={isLoading}
                  className="flex-1 h-full px-2 text-center outline-none"
                />
                <span className="px-3 text-slate-500 border-s border-border bg-slate-50 h-full inline-flex items-center text-xs shrink-0 whitespace-nowrap">
                  @uob.edu.ly
                </span>
              </div>
              {errors.studentId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">
                كلمة المرور
              </label>
              <input
                type="password"
                dir="ltr"
                {...register("password", {
                  required: "الحقل هذا ضروري",
                  minLength: {
                    value: 6,
                    message: "كلمة المرور قصيرة، زيد عليها شوي",
                  },
                  onChange: () => setError(""),
                })}
                disabled={isLoading}
                className="field"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
              <div className="mt-2 text-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-70"
            >
              {isLoading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-muted">
            ما عندكش حساب؟{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              سجل جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
