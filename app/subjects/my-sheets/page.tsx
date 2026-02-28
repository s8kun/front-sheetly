"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import Link from "next/link";
import { Sheet } from "@/app/types";
import { FileText, Inbox } from "lucide-react";
import { fetchJsonWithCache, fetchWithRetry } from "@/lib/network";
import { toArabicApiError } from "@/lib/api-errors";

/**
 * مكون صفحة ملفاتي المرفوعة (MySheetsPage).
 *
 * يعرض للطلاب قائمة بالشيتات التي قاموا برفعها مع حالة المراجعة الخاصة بكل ملف
 * (تمت الموافقة، مرفوض، قيد المراجعة).
 *
 * الحالة (State):
 * - `sheets`: مصفوفة الشيتات الخاصة بالمستخدم الحالي، تُجلب من نقطة `/my-sheets`.
 * - `isLoading`: لعرض رسوم التحميل (Skeleton) أثناء جلب البيانات الأساسية.
 * - `error`: لطباعة أي شريط أخطاء في حال فشل الاتصال بالخادم.
 *
 * تستخدم هذه الصفحة الكاش `fetchJsonWithCache` لتقليل الاستعلامات من السيرفر وعرض البيانات فوراً.
 *
 * @returns {JSX.Element} واجهة استعراض وتتبع حالة الملفات المرفوعة للمستخدم.
 */
export default function MySheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMySheets = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setError("يرجى تسجيل الدخول لعرض ملفاتك");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchJsonWithCache<Sheet[] | Sheet>(
          `my-sheets:${token.slice(0, 12)}`,
          async () => {
            const res = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_API_URL}/my-sheets`,
              {
                credentials: "include",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              },
              { retries: 2, retryDelayMs: 600 },
            );

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(
                toArabicApiError(
                  errorData.message,
                  "فشل في جلب البيانات من الخادم",
                ),
              );
            }

            return res.json();
          },
          60_000,
        );

        const sheetsArray = Array.isArray(data) ? data : data ? [data] : [];
        setSheets(sheetsArray);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء الاتصال بالخادم",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySheets();
  }, []);

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "approved":
        return "تمت الموافقة";
      case "rejected":
        return "مرفوض";
      default:
        return "قيد المراجعة";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-foreground">شيتاتي المرفوعة</h1>
        <p className="text-muted text-sm mt-1">تابع حالة كل ملف رفعته</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white animate-pulse rounded-lg border border-border"
            />
          ))}
        </div>
      ) : error ? (
        <div className="status-error text-center">
          <p className="font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm underline"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : sheets.length > 0 ? (
        <div className="grid gap-4">
          <AnimatePresence>
            {sheets.map((sheet) => (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={sheet.id}
                className="bg-white p-5 rounded-lg border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#b8cff3]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-foreground">{sheet.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">
                        {sheet.created_at
                          ? new Date(sheet.created_at).toLocaleDateString(
                              "ar-LY",
                            )
                          : "تاريخ غير متوفر"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#eaf2ff] text-primary rounded-full font-bold">
                        {sheet.type === "chapter"
                          ? "شابتر"
                          : sheet.type === "midterm"
                            ? "جزئي"
                            : "نهائي"}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-5 py-2 rounded-xl text-xs font-black border text-center ${getStatusStyles(sheet.status)}`}
                >
                  {getStatusLabel(sheet.status)}
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-border">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Inbox className="w-10 h-10" />
          </div>
          <p className="text-muted font-bold">ما رفعتش ملفات لحد الآن.</p>
          <Link
            href="/subjects/upload"
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover"
          >
            ارفع أول شيت
          </Link>
        </div>
      )}
    </div>
  );
}
