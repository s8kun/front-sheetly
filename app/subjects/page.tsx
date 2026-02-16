"use client";

import { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Subject } from "@/app/types";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";

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

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      const token = Cookies.get("token");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subjects?search=${searchQuery}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();

          // تحويل البيانات الأولية
          const initialData = data.map((sub: any, index: number) => ({
            ...sub,
            chaptersCount: 0, // مبدئياً صفر حتى نجلب التفاصيل
            color: UI_COLORS[index % UI_COLORS.length],
          }));
          setSubjects(initialData);
          setIsLoading(false); // نوقف التحميل الظاهري لسرعة العرض

          // الدخول في الخلفية لجلب التفاصيل وحساب العدد الحقيقي
          const detailsPromises = data.map(async (sub: any) => {
            try {
              const detailRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/subjects/${sub.code}`,
                {
                  credentials: "include",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              if (detailRes.ok) {
                const detail = await detailRes.json();
                console.log(`Subject ${sub.code} detail:`, detail); // Debug log
                // حساب المجموع: عدد الشيتات داخل كل شابتر + عدد الامتحانات
                // نلاحظ أن chapters قد تكون أرقاماً فقط أو كائنات، ولكن هذا لا يعطينا عدد الملفات داخل كل شابتر
                // إذا كان الباكند لا يعيد عدد الملفات، فسنعتمد على عدد الشباتر + الامتحانات مؤقتاً
                const totalCount =
                  (detail.chapters?.length || 0) +
                  (detail.midterms?.length || 0) +
                  (detail.finals?.length || 0);
                return { code: sub.code, count: totalCount };
              } else {
                console.error(
                  `Failed to fetch detail for ${sub.code}:`,
                  detailRes.status,
                );
              }
            } catch (e) {
              console.error(`Error fetching detail for ${sub.code}:`, e);
              return null;
            }
          });

          // تحديث الحالة بالأرقام الجديدة
          const counts = await Promise.all(detailsPromises);
          setSubjects((prev) =>
            prev.map((sub) => {
              const found = counts.find((c: any) => c && c.code === sub.code);
              return found ? { ...sub, chaptersCount: found.count } : sub;
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch subjects", error);
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSubjects, 400);
    return () => clearTimeout(timeoutId);
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
      <main className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">
            المواد الدراسية
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-sm">
            تصفح شيتاتك وامتحاناتك السابقه
          </p>
        </motion.div>

        <div className="relative mb-8 group">
          <input
            type="text"
            className="block w-full p-4 pr-12 text-lg text-slate-900 dark:text-slate-100 border-none rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-blue-100/60 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            placeholder="ابحث برمز المادة أو الاسم..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {isLoading && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="min-h-[400px] mb-10">
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
                    className="h-24 bg-white/50 rounded-3xl animate-pulse border border-white/60"
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
                      className="group flex flex-col md:flex-row items-center justify-between bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/40 hover:scale-[1.01] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto text-right">
                        <div
                          className={`w-14 h-14 ${subject.color} rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100`}
                        >
                          {subject.code}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-700 transition-colors">
                            {subject.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">
                            {subject.code}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700 w-full md:w-auto flex justify-between items-center gap-6">
                        <div className="text-center md:text-right">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">
                            عدد الشيتات
                          </p>
                          <div className="font-black text-slate-800 dark:text-slate-100">
                            {subject.chaptersCount}
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-inner">
                          <ArrowLeft
                            className="w-5 h-5 rtl:rotate-180"
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
                className="text-center py-20 bg-white/60 dark:bg-slate-900/60 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700"
              >
                <p className="text-slate-500 dark:text-slate-300 font-bold">
                  لا توجد مواد تطابق `{searchQuery}`
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isLoading && totalPages > 1 && (
          <nav className="flex justify-center mt-8 pb-10" dir="rtl">
            <ul className="flex -space-x-px text-sm h-10">
              <li>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center px-5 h-10 border border-slate-200 dark:border-slate-700 rounded-r-xl font-bold transition-all ${currentPage === 1 ? "bg-slate-50 dark:bg-slate-800 text-slate-300" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  السابق
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <li key={number}>
                    <button
                      onClick={() => goToPage(number)}
                      className={`flex items-center justify-center px-4 h-10 border border-slate-200 dark:border-slate-700 font-bold transition-all ${currentPage === number ? "bg-blue-600 text-white border-blue-600 z-10" : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 hover:bg-blue-50"}`}
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
                  className={`flex items-center justify-center px-5 h-10 border border-slate-200 dark:border-slate-700 rounded-l-xl font-bold transition-all ${currentPage === totalPages ? "bg-slate-50 dark:bg-slate-800 text-slate-300" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600"}`}
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
