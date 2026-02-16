"use client";

import { useState, useEffect, use, useMemo } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Activity from "@/components/Activity";
import { SubjectData, Sheet } from "@/app/types";
import Cookies from "js-cookie";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export default function SubjectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const subjectCode = resolvedParams.code;
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab =
    (searchParams.get("tab") as "chapters" | "midterms" | "finals") ||
    "chapters";

  const [data, setData] = useState<SubjectData | null>(null);
  // حالة جديدة لتخزين بيانات الشباتر الكاملة بعد جلبها
  const [enrichedChapters, setEnhancedChapters] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // دالة لتغيير التبويب وتحديث الرابط
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleDeleteSubject = async () => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذه المادة نهائياً؟ سيتم حذف جميع ملفاتها أيضاً!",
      )
    )
      return;

    const token = Cookies.get("token");
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subjects/${subjectCode}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        router.push("/subjects");
      } else {
        alert("فشل حذف المادة");
      }
    } catch (err) {
      alert("خطأ في الاتصال");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectCode) return;
      setLoading(true);
      const token = Cookies.get("token");
      try {
        // 1. جلب بيانات المادة الأساسية
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectCode}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        if (res.ok) {
          const result = await res.json();
          setData(result);

          // 2. إذا كان هناك شباتر (أرقام)، نقوم بجلب تفاصيلها فوراً للحصول على العدادات
          if (result.chapters && result.chapters.length > 0) {
            const chaptersPromises = result.chapters.map(
              async (item: any, index: number) => {
                if (item.file_url) return item; // إذا كان ملف جاهز، نتركه كما هو

                const chapterNum =
                  typeof item === "number"
                    ? item
                    : item.chapter_number || index + 1;
                try {
                  const chRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectCode}/chapters/${chapterNum}`,
                    {
                      credentials: "include",
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  if (chRes.ok) {
                    const chData = await chRes.json();
                    // إذا وجدنا ملفات، نأخذ أول ملف ليكون هو ممثل الشابتر (بما في ذلك عداده)
                    if (chData.sheets && chData.sheets.length > 0) {
                      return {
                        ...chData.sheets[0], // نأخذ بيانات الملف الأول (id, downloads_count, etc)
                        title: `شابتر ${chapterNum}`, // نحافظ على الاسم كشابتر
                        isLazy: false, // لم يعد lazy لأننا جلبناه
                        chapterNumber: chapterNum,
                      };
                    }
                  }
                } catch (e) {
                  console.error(e);
                }

                // في حالة الفشل أو عدم وجود ملفات، نعيد الهيكل القديم
                return {
                  id: `lazy-ch-${chapterNum}`,
                  title: `شابتر ${chapterNum}`,
                  chapterNumber: chapterNum,
                  isLazy: true,
                  type: "file",
                  downloads_count: 0,
                };
              },
            );

            const fullChapters = await Promise.all(chaptersPromises);
            setEnhancedChapters(fullChapters);
          } else {
            setEnhancedChapters([]);
          }
        } else {
          setError("المادة غير موجودة");
        }
      } catch (err) {
        setError("فشل الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectCode]);

  const midtermsData = useMemo(() => data?.midterms || [], [data]);
  const finalsData = useMemo(() => data?.finals || [], [data]);

  return (
    <div className={cairo.className}>
      <main className="relative z-10">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded-full w-1/3 mx-auto"></div>
            <div className="flex justify-center gap-4">
              <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
              <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
              <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 font-bold text-xl mb-2">{error}</div>
            <Link
              href="/subjects"
              className="text-blue-600 hover:underline text-sm"
            >
              العودة لقائمة المواد
            </Link>
          </div>
        ) : data ? (
          <>
            <div className="text-center mb-10 relative">
              {isAdmin && (
                <div className="absolute left-0 top-0 flex gap-2">
                  <button
                    onClick={handleDeleteSubject}
                    disabled={isDeleting}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="حذف المادة"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold tracking-wider uppercase">
                {data.subject.code}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mt-3 mb-2">
                {data.subject.name}
              </h1>
            </div>

            <div className="flex justify-center mb-10">
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1">
                {[
                  { id: "chapters", label: "الشيتات" },
                  { id: "midterms", label: "جزئي" },
                  { id: "finals", label: "نهائي" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-slate-500 dark:text-slate-300 hover:text-blue-600"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={activeTab === "chapters" ? "block" : "hidden"}>
              {/* استخدام البيانات المحسنة التي تحتوي على العدادات الحقيقية */}
              <Activity
                items={enrichedChapters}
                type="file"
                emptyMessage="لا توجد شيتات مضافة بعد"
              />
            </div>
            <div className={activeTab === "midterms" ? "block" : "hidden"}>
              <Activity
                items={midtermsData}
                type="exam"
                emptyMessage="لا توجد امتحانات جزئية"
              />
            </div>
            <div className={activeTab === "finals" ? "block" : "hidden"}>
              <Activity
                items={finalsData}
                type="exam"
                emptyMessage="لا توجد امتحانات نهائية"
              />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
