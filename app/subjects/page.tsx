"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { m, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useSubjects } from "./context";

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
 * @returns {JSX.Element} واجهة تصفح المواد الدراسية مع البحث.
 */
export default function SubjectsPage() {
  const { subjects, isLoading, error } = useSubjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 8 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const query = searchQuery.trim().toLowerCase();
    return subjects.filter(
      (sub) =>
        sub.name.toLowerCase().includes(query) ||
        sub.code.toLowerCase().includes(query),
    );
  }, [subjects, searchQuery]);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredSubjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
    return pages;
  };

  return (
    <div>
      <main>
        <m.div
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
        </m.div>

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

        <div className="mb-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <m.div
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
              </m.div>
            ) : currentItems.length > 0 ? (
              <m.div
                key={`page-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4"
              >
                {currentItems.map((subject) => (
                  <m.div key={subject.id} variants={itemVariants} exit="exit">
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
                  </m.div>
                ))}
              </m.div>
            ) : (
              <m.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-lg border border-dashed border-border"
              >
                <p className="text-muted font-bold">لا توجد مواد</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {!isLoading && totalPages > 1 && (
          <nav className="flex justify-center mt-6 pb-4" dir="rtl">
            <ul className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <li>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center px-4 h-10 rounded-lg font-bold transition-colors ${
                    currentPage === 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white text-foreground hover:bg-slate-50 border border-border"
                  }`}
                >
                  السابق
                </button>
              </li>
              {getPageNumbers().map((number, idx) => (
                <li key={idx}>
                  {number === "..." ? (
                    <span className="flex items-center justify-center px-2 h-10 text-slate-500 font-bold">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => goToPage(number as number)}
                      className={`flex items-center justify-center px-4 h-10 rounded-lg font-bold transition-all ${
                        currentPage === number
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                          : "bg-white text-muted hover:bg-slate-50 border border-border"
                      }`}
                    >
                      {number}
                    </button>
                  )}
                </li>
              ))}
              <li>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center px-4 h-10 rounded-lg font-bold transition-colors ${
                    currentPage === totalPages
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white text-foreground hover:bg-slate-50 border border-border"
                  }`}
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
