"use client";

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toArabicApiError } from "@/lib/api-errors";

interface RegisterFormValues {
  name: string;
  studentId: string;
  password: string;
  confirmPassword: string;
}

/**
 * مكون صفحة التسجيل (Register).
 *
 * يتعامل مع إنشاء حساب طالب جديد. يتطلب إدخال الاسم الرباعي، رقم قيد صحيح،
 * وكلمة مرور قوية مطابقة لتأكيد كلمة المرور. الـ API يعتمد على بناء البريد
 * الجامعي (itstd.[ID]@uob.edu.ly) من رقم القيد المُدخل.
 *
 * الحالة (State):
 * - `isLoading`: لتعطيل إرسال النموذج أثناء معالجة الطلب في السيرفر.
 * - `error`: لعرض رسائل الأخطاء (مثل البريد محجوز، بيانات خاطئة).
 *
 * سير العمل (Flow):
 * 1. يتحقق من صحة المدخلات محلياً (طول الاسم، توافق كلمة المرور).
 * 2. عند الإرسال، يُركب البريد الجامعي ويرسل البيانات إلى نقطة `/register`.
 * 3. عند نجاح الإنشاء، يحوّل المستخدم لصفحة تأكيد الرمز `/register/verify`.
 * 4. في حال كان الحساب موجوداً ولكنه غير مفعل (403 أو 500 ورسالة مخصصة)، يحوله لتأكيد الحساب مع طلب إعادة إرسال.
 *
 * @returns {JSX.Element} واجهة التسجيل.
 */
export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      studentId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: RegisterFormValues) => {
    setError("");

    setIsLoading(true);

    const payload = {
      name: values.name.trim(),
      email: `itstd.${values.studentId.trim()}@uob.edu.ly`,
      password: values.password,
      password_confirmation: values.confirmPassword,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(
          `/register/verify?email=${encodeURIComponent(payload.email)}`,
        );
      } else if (
        res.status === 500 &&
        data.message?.includes("تم إنشاء الحساب")
      ) {
        router.push(
          `/register/verify?email=${encodeURIComponent(payload.email)}&resend=true`,
        );
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          let errorMessage = Array.isArray(firstError)
            ? String(firstError[0])
            : String(firstError || "");

          if (errorMessage.includes("email has already been taken")) {
            errorMessage = "هذا البريد مسجل من قبل. ادخل أو كمل تأكيد الحساب.";
          }
          setError(toArabicApiError(errorMessage, "بيانات غير صالحة"));
        } else {
          setError(
            toArabicApiError(data.message, "حدث خطأ أثناء إنشاء الحساب."),
          );
        }
      }
    } catch (err) {
      setError("فشل الاتصال بالخادم، حاول بعد شوي.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="page-shell">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="panel w-full max-w-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black">فتح حساب جديد</h1>
            <p className="text-sm text-muted mt-2">املأ البيانات بشكل صحيح</p>
          </div>

          {error && <div className="status-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold">
                الاسم الكامل
              </label>
              <input
                type="text"
                placeholder="الاسم الثلاثي"
                {...register("name", {
                  required: "الحقل هذا ضروري",
                  minLength: {
                    value: 3,
                    message: "اكتب اسمك الثلاثي بشكل صحيح",
                  },
                  onChange: () => setError(""),
                })}
                disabled={isLoading}
                className="field"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">
                رقم القيد
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
                    onChange: () => setError(""),
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      value: 8,
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
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  dir="ltr"
                  {...register("confirmPassword", {
                    required: "الحقل هذا ضروري",
                    validate: (value) =>
                      value === passwordValue ||
                      "تأكيد كلمة المرور مش نفس كلمة المرور",
                    onChange: () => setError(""),
                  })}
                  disabled={isLoading}
                  className="field"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-70"
            >
              {isLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-muted">
            عندك حساب؟{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              سجل دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
