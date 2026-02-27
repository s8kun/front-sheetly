"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { m } from "framer-motion";
import Activity from "@/components/Activity";
import { SubjectData, Sheet } from "@/app/types";
import Cookies from "js-cookie";
import { fetchJsonWithCache, fetchWithRetry } from "@/lib/network";
import { useToast } from "@/components/ToastProvider";

type EnhancedSheet = Sheet & {
  isLazy?: boolean;
  chapterNumber?: number;
};

type ChapterItem = number | (Partial<Sheet> & { chapter_number?: number });

/**
 * مكون تفاصيل المادة (SubjectPage).
 *
 * يعرض كل التفاصيل المتعلقة بمادة معينة (مثل مبادئ حوسبة IT101) ويتضمن الشباتر،
 * امتحانات الجزئي، والامتحانات النهائية مع إمكانية التنقل بينها عبر تبويبات (Tabs).
 * يمنح للأدمن فقط الصلاحية لحذف المادة كاملاً.
 *
 * يعتمد على الخطاف `use(params)` المتوفر في React 19 لحل مسارات الوصلات الديناميكية.
 *
 * الحالة (State):
 * - `data`: البيانات الكاملة الواردة من API للمادة (شيتات وامتحانات وتفاصيل المادة).
 * - `enrichedChapters`: مصفوفة منظمة تجمع معلومات الشباتر وشيتاتها في كائنات.
 * - `user`: بيانات المستخدم الحالي المحفوظة في الـ Cookies (للتحقق من صلاحية الأدمن).
 * - `activeTab`: حالة التبويب الحالي المقروءة من الـ URL.
 *
 * @param {Promise<{ code: string }>} params - معلمات الوصلة الديناميكية تحتوي على رمز المادة.
 * @returns {JSX.Element} واجهة تفاصيل المادة ومحتواها المقسم على تبويبات.
 */
export default function SubjectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const subjectCode = resolvedParams.code;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const activeTab =
    (searchParams.get("tab") as "chapters" | "midterms" | "finals") ||
    "chapters";

  const [data, setData] = useState<SubjectData | null>(null);
  // حالة جديدة لتخزين بيانات الشباتر الكاملة بعد جلبها
  const [enrichedChapters, setEnhancedChapters] = useState<EnhancedSheet[]>([]);
  const [user] = useState<{ role?: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const savedUser = Cookies.get("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // دالة لتغيير التبويب وتحديث الرابط
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        showToast("تم حذف المادة", "success");
        router.push("/subjects");
      } else {
        showToast("فشل حذف المادة", "error");
      }
    } catch {
      showToast("خطأ في الاتصال", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (!subjectCode) return;
      setLoading(true);
      const token = Cookies.get("token");

      try {
        const result = await fetchJsonWithCache<SubjectData>(
          `subject:detail:${subjectCode}:${(token || "guest").slice(0, 12)}`,
          async () => {
            const res = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectCode}`,
              {
                credentials: "include",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
                signal: controller.signal,
              },
              { retries: 2, retryDelayMs: 600 },
            );

            if (!res.ok) {
              if (res.status === 404) {
                throw new Error("NOT_FOUND");
              }
              throw new Error("Failed to fetch subject details");
            }

            return res.json();
          },
          90_000,
        );

        setData(result);

        const normalizedChapters: EnhancedSheet[] =
          (result.chapters as ChapterItem[] | undefined)?.map(
            (item, index: number) => {
              if (typeof item === "object" && item !== null && item.file_url) {
                return item as EnhancedSheet;
              }

              const chapterNum =
                typeof item === "number"
                  ? item
                  : item.chapter_number || index + 1;

              return {
                id:
                  typeof item === "object" && item !== null && item.id
                    ? item.id
                    : -chapterNum,
                title:
                  typeof item === "object" && item !== null && item.title
                    ? item.title
                    : `شابتر ${chapterNum}`,
                chapterNumber: chapterNum,
                isLazy: true,
                type: "chapter",
                file_url: "",
                downloads_count: 0,
                created_at:
                  typeof item === "object" && item !== null && item.created_at
                    ? item.created_at
                    : new Date().toISOString(),
              };
            },
          ) || [];

        setEnhancedChapters(normalizedChapters);
      } catch (err) {
        if (!controller.signal.aborted) {
          if (err instanceof Error && err.message === "NOT_FOUND") {
            setError("المادة غير موجودة");
          } else {
            setError("فشل الاتصال بالخادم");
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [subjectCode]);

  const midtermsData = useMemo(() => data?.midterms || [], [data]);
  const finalsData = useMemo(() => data?.finals || [], [data]);

  return (
    <div>
      <main>
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3 mx-auto"></div>
            <div className="flex justify-center gap-4">
              <div className="h-10 bg-slate-200 rounded-lg w-24" />
              <div className="h-10 bg-slate-200 rounded-lg w-24" />
              <div className="h-10 bg-slate-200 rounded-lg w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 font-bold text-xl mb-2">{error}</div>
            <Link
              href="/subjects"
              className="text-primary hover:underline text-sm"
            >
              العودة لقائمة المواد
            </Link>
          </div>
        ) : data ? (
          <>
            <div className="text-center mb-10 relative">
              {isAdmin && (
                <div className="absolute inset-s-0 top-0 flex gap-2">
                  <button
                    onClick={handleDeleteSubject}
                    disabled={isDeleting}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white"
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
              <span className="bg-[#eaf2ff] text-primary border border-[#c9dcff] px-3 py-1 rounded-full text-sm font-bold tracking-wider uppercase">
                {data.subject.code}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-foreground mt-3 mb-2">
                {data.subject.name}
              </h1>
            </div>

            <div className="flex justify-center mb-10">
              <div className="bg-white p-1 rounded-lg border border-border flex gap-1">
                {[
                  { id: "chapters", label: "الشيتات" },
                  { id: "midterms", label: "جزئي" },
                  { id: "finals", label: "نهائي" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-2.5 rounded-md text-sm font-bold ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <m.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-md"
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
