"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Cairo } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toArabicApiError } from "@/lib/api-errors";

interface VerifyOtpFormValues {
  code: string;
}

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 60;

/**
 * مكون صفحة تأكيد البريد الإلكتروني برمز الـ OTP.
 *
 * بعد التسجيل المبدئي، تصل رسالة للبريد الجامعي تحتوي على رمز 4 أرقام.
 * هذه الصفحة تسمح للمستخدم بإدخال الرمز لتفعيل حسابه، مع إمكانية إعادة إرسال الرمز.
 *
 * الحالة (State):
 * - `otp`: مصفوفة من أربع خانات تمثل الرمز المُدخل.
 * - `isLoading`: أثناء عملية التحقق من الرمز في الخادم.
 * - `error` & `message`: لعرض رسائل النجاح أو الفشل.
 * - `cooldown` & `isResending`: لإدارة توقيت إعادة إرسال الرمز (60 ثانية).
 *
 * سير العمل (Flow):
 * 1. الإرسال التلقائي إذا تم تعبئة جميع الخانات.
 * 2. دعم اللصق المباشر للرمز كله (Paste).
 * 3. عند النجاح، التوجيه لصفحة الدخول `/login`.
 *
 * @returns {JSX.Element} واجهة تأكيد الرمز المكونة من 4 صناديق إدخال.
 */
export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<VerifyOtpFormValues>({
    defaultValues: { code: "" },
  });

  /* ---------------- Countdown ---------------- */

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ---------------- Resend OTP ---------------- */

  const handleResendOTP = useCallback(async () => {
    if (!email || isResending || cooldown > 0) return;

    setIsResending(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("تمت إعادة إرسال الرمز لبريدك.");
        setCooldown(RESEND_COOLDOWN);
      } else {
        if (res.status === 429) {
          setError("طلبات كثيرة، استنى دقيقة وحاول.");
        } else {
          setError(toArabicApiError(data.message, "فشل إرسال الرمز."));
        }
      }
    } catch {
      setError("خطأ في الاتصال بالخادم.");
    } finally {
      setIsResending(false);
    }
  }, [email, isResending, cooldown]);

  /* ---------------- First Load ---------------- */

  useEffect(() => {
    if (!email) {
      setError("البريد مفقود. ارجع وسجل من جديد.");
    }
  }, [email]);

  /* ---------------- Handle Input Change ---------------- */

  const updateOtp = (newOtp: string[]) => {
    setOtp(newOtp);
    const code = newOtp.join("");
    setValue("code", code, { shouldValidate: true });
    clearErrors("code");
    setError("");
    setMessage("");

    if (code.length === OTP_LENGTH) {
      handleSubmit(onSubmit)();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    updateOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted
      .slice(0, OTP_LENGTH)
      .split("")
      .concat(Array(OTP_LENGTH).fill(""))
      .slice(0, OTP_LENGTH);

    updateOtp(newOtp);
    inputRefs.current[OTP_LENGTH - 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ---------------- Submit ---------------- */

  const onSubmit = async (values: VerifyOtpFormValues) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/register/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            code: values.code,
          }),
          signal: abortRef.current.signal,
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("تم تأكيد الحساب. جاري تحويلك...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        if (res.status === 429) {
          setError("وصلت للحد المسموح للمحاولات. انتظر شوي.");
        } else {
          setError(toArabicApiError(data.message, "الرمز غير صحيح أو منتهي."));
        }
      }
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.name !== "AbortError") {
        setError("فشل الاتصال بالخادم.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div dir="rtl" className={`page-shell ${cairo.className}`}>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="panel w-full max-w-md p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black">تأكيد الحساب</h1>
            <p className="text-sm text-muted mt-2">
              اكتب رمز التحقق المرسل للبريد
            </p>
            <p className="text-sm text-primary mt-1" dir="ltr">
              {email}
            </p>
          </div>

          {error && <div className="status-error mb-4">{error}</div>}
          {message && <div className="status-success mb-4">{message}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input
              type="hidden"
              {...register("code", {
                required: "ادخل الرمز كامل (4 أرقام)",
                pattern: {
                  value: /^\d{4}$/,
                  message: "ادخل الرمز كامل (4 أرقام)",
                },
              })}
            />

            <div className="flex justify-center gap-2" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-12 rounded-lg border border-border text-center text-lg font-bold outline-none focus:border-primary"
                />
              ))}
            </div>

            {errors.code && (
              <p className="text-red-600 text-sm text-center">
                {errors.code.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-70"
            >
              {isLoading ? "جاري التحقق..." : "تأكيد الرمز"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted">
            ما وصلكش الرمز؟{" "}
            <button
              onClick={handleResendOTP}
              disabled={isResending || cooldown > 0}
              className="text-primary font-bold hover:underline disabled:opacity-60"
            >
              {cooldown > 0
                ? `إعادة الإرسال بعد ${cooldown} ثانية`
                : isResending
                  ? "جاري الإرسال..."
                  : "إعادة الإرسال"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
