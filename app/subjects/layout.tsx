"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cairo } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  BookOpen,
  ShieldCheck,
  Upload,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

export default function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const menuItems = [
    {
      name: "المواد الدراسية",
      href: "/subjects",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    // نظهر "شيتاتي المرفوعة" للطالب فقط
    ...(!isAdmin
      ? [
          {
            name: "شيتاتي المرفوعة",
            href: "/subjects/my-sheets",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
        ]
      : []),
    {
      name: "رفع شيت جديد",
      href: "/subjects/upload",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      ),
    },
    // إضافة رابط لوحة التحكم للأدمن في القائمة الجانبية
    ...(isAdmin
      ? [
          {
            name: "لوحة التحكم",
            href: "/admin/dashboard",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <div
      dir="rtl"
      className={`${cairo.className} min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-row-reverse`}
    >
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-110 h-screen transition-all duration-300 ease-in-out transform 
                ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} 
                lg:translate-x-0 lg:sticky bg-white/90 dark:bg-slate-900/80 border-l border-slate-200 dark:border-slate-700 shrink-0  
                ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Branding / Toggle Button */}
          <div
            className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            {!isCollapsed && (
              <Link
                href="/"
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="w-9 h-9 bg-linear-to-tr from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ">
                  ش
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  شيتاتي
                </h1>
              </Link>
            )}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? "bg-blue-600 text-white   font-bold"
                      : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Community Support Card - Moved inside nav but at the end of items */}
            {!isCollapsed && !isAdmin && (
              <div className="pt-6 pb-2 px-1">
                <div className="bg-slate-900 rounded-[2rem] p-5 text-white relative overflow-hidden group  ">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-600/30 transition-colors" />
                  <div className="relative z-10 text-right">
                    <h4 className="font-bold text-sm mb-1.5 flex items-center justify-end gap-2">
                      <span>ساهم معنا</span>
                      <span className="text-lg">🚀</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                      ساعد زملائك برفع الشيتات لبناء مجتمع دراسي أقوى وأكبر.
                    </p>
                    <Link
                      href="/subjects/upload"
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center justify-center w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl text-[10px] font-bold transition-all  "
                    >
                      ارفع شيت الآن
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--background)]">
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 sticky top-0 z-[90]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              ش
            </div>
            <span className="font-black text-slate-900 dark:text-slate-100">
              شيتاتي
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 bg-slate-100 rounded-xl"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-6 md:p-10">
            {/* Dynamic Breadcrumbs */}
            <nav className="mb-8 flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/60 dark:border-slate-700/60 ">
                <li className="inline-flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 ml-1.5" />
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300 mx-1">/</span>
                </li>
                <li className="inline-flex items-center">
                  <Link
                    href="/subjects"
                    className={`inline-flex items-center text-xs font-bold ${pathname === "/subjects" ? "text-blue-600" : "text-slate-500 dark:text-slate-300 hover:text-blue-600"}`}
                  >
                    <BookOpen className="w-3.5 h-3.5 ml-1.5" />
                    المواد
                  </Link>
                </li>
                {pathname !== "/subjects" && (
                  <>
                    <li>
                      <span className="text-slate-300 mx-1">/</span>
                    </li>
                    <li className="inline-flex items-center">
                      <span className="inline-flex items-center text-xs font-bold text-blue-600">
                        {pathname.includes("upload") ? (
                          <Upload className="w-3.5 h-3.5 ml-1.5" />
                        ) : pathname.includes("my-sheets") ? (
                          <FileText className="w-3.5 h-3.5 ml-1.5" />
                        ) : pathname.includes("dashboard") ? (
                          <LayoutDashboard className="w-3.5 h-3.5 ml-1.5" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 ml-1.5" />
                        )}
                        {pathname.includes("upload")
                          ? "رفع شيت"
                          : pathname.includes("my-sheets")
                            ? "شيتاتي"
                            : pathname.includes("dashboard")
                              ? "لوحة التحكم"
                              : pathname.split("/").pop()?.toUpperCase()}
                      </span>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
