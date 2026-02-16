"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import Link from "next/link";
import { Sheet } from "@/app/types";
import { FileText, Inbox } from "lucide-react";

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/my-sheets`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const data = await res.json();
        console.log("My Sheets API Response Status:", res.status);
        console.log("My Sheets Data:", data);

        if (res.ok) {
          const sheetsArray = Array.isArray(data) ? data : data ? [data] : [];
          setSheets(sheetsArray);
        } else {
          setError(data.message || "فشل في جلب البيانات من الخادم");
        }
      } catch (error) {
        console.error("Failed to fetch my sheets", error);
        setError("حدث خطأ أثناء الاتصال بالخادم");
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          شيتاتي المرفوعة
        </h1>
        <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">
          تتبع حالة ملفاتك التي ساهمت بها
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white/90 dark:bg-slate-900/70 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-center">
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={sheet.id}
                className="bg-white/90 dark:bg-slate-900/70 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 dark:hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      {sheet.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {sheet.created_at
                          ? new Date(sheet.created_at).toLocaleDateString(
                              "ar-LY",
                            )
                          : "تاريخ غير متوفر"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/90 dark:bg-slate-900/70 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Inbox className="w-10 h-10" />
          </div>
          <p className="text-slate-500 dark:text-slate-300 font-bold">
            لم تقم برفع أي ملفات بعد.
          </p>
          <Link
            href="/subjects/upload"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            ارفع أول شيت الآن وساهم في نفع زملائك
          </Link>
        </div>
      )}
    </div>
  );
}
