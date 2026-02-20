"use client";

import React, { useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toArabicApiError } from "@/lib/api-errors";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

/**
 * مكون تعيين كلمة مرور جديدة (ResetPassword).
 *
 * يعالج الخطوة الأخيرة من عملية استرجاع كلمة المرور.
 * يصل المستخدم إلى هذه الصفحة عن طريق رابط مرسل لبريده يحتوي على رمز (`token`) وبريده الإلكتروني (`email`).
 *
 * الحالة (State):
 * - `token`, `email`: يتم جلبها من معلمات الرابط (URL Query Params).
 * - `isLoading`: لتعطيل النموذج والزر أثناء الطلب.
 * - `error`: يعرض رسائل الأخطاء (مثل الرابط غير صالح أو انتهت صلاحيته).
 * - `message`: لعرض رسالة تفيد بنجاح التغيير.
 *
 * سير العمل (Flow):
 * 1. يقرأ الـ `token` والـ `email` من الرابط، فإذا لم يجدهما يظهر خطأ.
 * 2. يطلب من المستخدم إدخال وتأكيد كلمة مرور جديدة (8 خانات كحد أدنى).
 * 3. عند الإرسال يتصل بنقطة الـ API `/reset-password`.
 * 4. عند النجاح، التوجيه لصفحة تسجيل الدخول بعد مرور 3 ثواني.
 *
 * @returns {JSX.Element} واجهة تعيين كلمة المرور الجديدة.
 */
export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const passwordValue = watch("password");

  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError("");
    setMessage("");

    if (!token || !email) {
      setError("الرابط غير صالح. افتح الرابط الصحيح من بريدك.");
      return;
    }

    setIsLoading(true);

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
            password: values.password,
            password_confirmation: values.confirmPassword,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("تم تغيير كلمة المرور بنجاح.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(toArabicApiError(data.message, "فشل تغيير كلمة المرور."));
      }
    } catch {
      setError("فشل الاتصال بالخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="page-shell">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="panel w-full max-w-md p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black">كلمة مرور جديدة</h1>
            <p className="text-sm text-muted mt-2">
              ادخل كلمة المرور الجديدة لحسابك
            </p>
          </div>

          {error && <div className="status-error mb-4">{error}</div>}
          {message && <div className="status-success mb-4">{message}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold">
                كلمة المرور الجديدة
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
                  onChange: () => {
                    setError("");
                    setMessage("");
                  },
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
                  onChange: () => {
                    setError("");
                    setMessage("");
                  },
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-70"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
