"use client";

import React, { useEffect, useState } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toArabicApiError } from "@/lib/api-errors";

interface ForgotPasswordFormValues {
  studentId: string;
}

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

/**
 * مكون استرجاع كلمة المرور (ForgotPassword).
 *
 * يسمح للطلاب بطلب رابط إعادة تعيين كلمة المرور عبر إدخال رقم القيد الخاص بهم.
 * يتضمن ميزة العد التنازلي لمدة 60 ثانية (Cooldown) لمنع الإرسال المتكرر للطلبات ولحماية الـ API.
 *
 * الحالة (State):
 * - `isLoading`: لتعطيل النموذج أثناء انتظار استجابة السيرفر.
 * - `error`: يعرض أخطاء التحقق أو الأخطاء الواردة من الـ API المعربة.
 * - `cooldown`: يخزن حالة العداد لإيقاف زر الإرسال لمدة دقيقة بعد النجاح.
 * - `message`: يعرض رسالة نجاح خضراء عند إرسال الرابط للبريد.
 *
 * @returns {JSX.Element} واجهة استرجاع كلمة المرور المكونة من حقل رقم القيد.
 */
export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      studentId: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (cooldown > 0) return;
    setError("");
    setMessage("");

    const cleanId = values.studentId.trim();

    setIsLoading(true);
    const fullEmail = `itstd.${cleanId}@uob.edu.ly`;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: fullEmail }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("تم إرسال رابط إعادة التعيين.");
        setCooldown(60);
      } else {
        if (res.status === 429) {
          setCooldown(60);
          setError("طلبات كثيرة. حاول بعد دقيقة.");
          return;
        }
        let finalError = "حدث خطأ غير متوقع.";

        if (res.status === 422) {
          const allErrors = data.errors
            ? Object.values(data.errors).flat()
            : [data.message];
          const isNotFound = allErrors.some(
            (err) =>
              typeof err === "string" &&
              (err.toLowerCase().includes("selected email is invalid") ||
                err.toLowerCase().includes("can't find a user")),
          );

          if (isNotFound) {
            finalError = "الحساب هذا مش موجود. تأكد من رقم القيد.";
          } else if (allErrors[0]) {
            finalError = allErrors[0] as string;
          }
        } else if (res.status === 404) {
          finalError = "المسار غير موجود في الخادم.";
        } else {
          finalError = toArabicApiError(data.message, finalError);
        }

        setError(finalError);
      }
    } catch {
      setError("فشل الاتصال بالخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldown > 0]);

  return (
    <div dir="rtl" className={`page-shell ${cairo.className}`}>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="panel w-full max-w-md p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black">استرجاع كلمة المرور</h1>
            <p className="text-sm text-muted mt-2">
              اكتب رقم القيد لإرسال رابط الاسترجاع
            </p>
          </div>

          {error && <div className="status-error mb-4">{error}</div>}
          {message && <div className="status-success mb-4">{message}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold">
                البريد الجامعي
              </label>
              <div
                className="field flex items-center p-0 overflow-hidden"
                dir="ltr"
              >
                <span className="px-2 sm:px-3 text-slate-500 border-e border-border bg-slate-50 h-full inline-flex items-center text-[11px] sm:text-sm shrink-0">
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
                    onChange: () => {
                      setError("");
                      setMessage("");
                    },
                  })}
                  disabled={isLoading}
                  className="flex-1 min-w-0 h-full px-1 sm:px-2 text-center outline-none text-[11px] sm:text-sm"
                />
                <span className="px-2 sm:px-3 text-slate-500 border-s border-border bg-slate-50 h-full inline-flex items-center text-[11px] sm:text-sm shrink-0 whitespace-nowrap">
                  @uob.edu.ly
                </span>
              </div>
              {errors.studentId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="btn-primary w-full disabled:opacity-70"
            >
              {isLoading
                ? "جاري الإرسال..."
                : cooldown > 0
                  ? `حاول بعد ${cooldown} ثانية`
                  : "إرسال الرابط"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-muted">
            تذكرت كلمة المرور؟{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
