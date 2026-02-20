"use client";

import { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Subject } from "@/app/types";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import { fetchJsonWithCache, fetchWithRetry } from "@/lib/network";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "900"],
});

const UI_COLORS = [
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-blue-600",
  "bg-sky-600",
  "bg-cyan-600",
  "bg-blue-400",
  "bg-sky-400",
  "bg-cyan-400",
  "bg-blue-700",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * مكون صفحة المواد الدراسية (SubjectsPage).
 *
 * تعرض هذه الصفحة قائمة بجميع المواد الجامعية المتاحة مع تقسيمها في صفحات (Pagination).
 * تتضمن ميزة بحث تتيح للطلاب تصفية المواد حسب الرمز أو الاسم.
 *
 * الحالة (State):
 * - `subjects`: مصفوفة من كائنات `Subject` المحضرة من הـ API.
 * - `searchQuery`: النص الحالي المكتوب في حقل البحث.
 * - `currentPage`: رقم الصفحة الحالية لعرض المواد.
 * - `isLoading`: حالة التحميل أثناء استدعاء البيانات من الخادم.
 * - `itemsPerPage`: عدد المواد التي تظهر في الصفحة الواحدة (متغير حسب حجم الشاشة).
 * - `error`: لتخزين وعرض أي أخطاء من الخادم أو الشبكة.
 *
 * @returns {JSX.Element} واجهة تصفح المواد الدراسية مع البحث.
 */
export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchSubjects = async () => {
      setIsLoading(true);
      setError("");
      const token = Cookies.get("token");
      try {
        const cacheKey = `subjects:list:${searchQuery.trim().toLowerCase()}:${(token || "guest").slice(0, 12)}`;
        const data = await fetchJsonWithCache<Subject[]>(
          cacheKey,
          async () => {
            const res = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_API_URL}/subjects?search=${encodeURIComponent(searchQuery)}`,
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
              throw new Error("فشل في تحميل المواد");
            }

            return res.json();
          },
          90_000,
        );

        const initialData = data.map((sub, index) => ({
          ...sub,
          chaptersCount: sub.chaptersCount ?? 0,
          color: UI_COLORS[index % UI_COLORS.length],
        }));

        setSubjects(initialData);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("فشل في تحميل المواد", err);
        setError(
          "حدث خطأ أثناء تحميل المواد الدراسية. يرجى المحاولة مرة أخرى.",
        );
      }

      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSubjects, 700);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 8 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(subjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = subjects.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={cairo.className}>
      <main>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-black text-foreground mb-2">
            المواد الدراسية
          </h1>
          <p className="text-muted text-sm">
            اختار المادة اللي تبيها وخش عليها مباشرة
          </p>
        </motion.div>

        <div className="relative mb-6">
          <input
            type="text"
            className="field pe-10"
            placeholder="ابحث برمز المادة أو الاسم..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {isLoading && (
            <div className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && <div className="status-error mb-6">{error}</div>}

        <div className="min-h-[400px] mb-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-white rounded-lg animate-pulse border border-border"
                  />
                ))}
              </motion.div>
            ) : currentItems.length > 0 ? (
              <motion.div
                key={`page-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4"
              >
                {currentItems.map((subject) => (
                  <motion.div
                    key={subject.id}
                    variants={itemVariants}
                    exit="exit"
                  >
                    <Link
                      href={`/subjects/${subject.code}`}
                      className="group flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg border border-border hover:border-[#b8cff3]"
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto text-right">
                        <div
                          className={`w-12 h-12 ${subject.color} rounded-lg flex items-center justify-center text-white font-black text-sm`}
                        >
                          {subject.code}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-foreground group-hover:text-primary">
                            {subject.name}
                          </h3>
                          <span className="text-[10px] text-muted font-bold bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            {subject.code}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border w-full md:w-auto flex justify-between items-center gap-6">
                        <div className="text-center md:text-right">
                          <p className="text-[10px] text-muted font-bold mb-0.5">
                            عدد الشيتات
                          </p>
                          <div className="font-black text-foreground">
                            {subject.chaptersCount}
                          </div>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-primary flex items-center justify-center text-slate-500 group-hover:text-white">
                          <ArrowLeft
                            className="w-4 h-4 rtl:rotate-180"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-lg border border-dashed border-border"
              >
                <p className="text-muted font-bold">لا توجد مواد</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isLoading && totalPages > 1 && (
          <nav className="flex justify-center mt-6 pb-4" dir="rtl">
            <ul className="flex -space-x-px text-sm h-10">
              <li>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center px-5 h-10 border border-border rounded-r-lg font-bold ${currentPage === 1 ? "bg-slate-100 text-slate-400" : "bg-white text-foreground hover:bg-slate-50"}`}
                >
                  السابق
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <li key={number}>
                    <button
                      onClick={() => goToPage(number)}
                      className={`flex items-center justify-center px-4 h-10 border border-border font-bold ${currentPage === number ? "bg-primary text-white border-primary z-10" : "bg-white text-muted hover:bg-slate-50"}`}
                    >
                      {number}
                    </button>
                  </li>
                ),
              )}
              <li>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center px-5 h-10 border border-border rounded-l-lg font-bold ${currentPage === totalPages ? "bg-slate-100 text-slate-400" : "bg-white text-foreground hover:bg-slate-50"}`}
                >
                  التالي
                </button>
              </li>
            </ul>
          </nav>
        )}
      </main>
    </div>
  );
}
