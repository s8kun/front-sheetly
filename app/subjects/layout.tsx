"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cairo } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Upload,
  FileText,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import Cookies from "js-cookie";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

/**
 * مكون التخطيط (Layout) لجميع صفحات قسم المواد الدراسية.
 *
 * يوفر الهيكلية الأساسية التي تتضمن القائمة الجانبية (Sidebar) وشريط التنقل العلوي للمسارات (Breadcrumbs).
 * يتعامل مع تجربة المستخدم على الشاشات الكبيرة والصغيرة (Responsive Design) ويظهر القائمة الجانبية بشكل منزلق
 * في الشاشات الصغيرة مع تأثيرات حركية.
 *
 * يعرض روابطاً مختلفة بناءً على دور المستخدم (أدمن أم طالب)، مما يتيح للأدمن الدخول للوحة التحكم،
 * ويمنع إظهار "شيتاتي" له، بينما تظهر للطلاب.
 *
 * @param {Object} props - خصائص المكون (الأبناء `children`).
 * @returns {JSX.Element} غلاف التخطيط الذي يحيط بصفحات المواد.
 */
export default function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user] = useState<{ role?: string } | null>(() => {
    try {
      const savedUser = Cookies.get("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const pathname = usePathname();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const menuItems = [
    {
      name: "المواد",
      href: "/subjects",
      icon: <BookOpen className="w-5 h-5" />,
    },
    ...(!isAdmin
      ? [
          {
            name: "شيتاتي",
            href: "/subjects/my-sheets",
            icon: <FileText className="w-5 h-5" />,
          },
        ]
      : []),
    {
      name: "رفع شيت",
      href: "/subjects/upload",
      icon: <Upload className="w-5 h-5" />,
    },
    ...(isAdmin
      ? [
          {
            name: "لوحة التحكم",
            href: "/admin/dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  const breadcrumbs = useMemo(() => {
    const items: { label: string; href?: string; current?: boolean }[] = [
      { label: "الرئيسية", href: "/" },
      { label: "المواد", href: "/subjects" },
    ];

    if (pathname === "/subjects") {
      items[1].current = true;
      return items;
    }

    if (pathname.includes("/subjects/upload")) {
      items.push({ label: "رفع شيت", current: true });
      return items;
    }

    if (pathname.includes("/subjects/my-sheets")) {
      items.push({ label: "شيتاتي", current: true });
      return items;
    }

    if (pathname.includes("/admin/dashboard")) {
      items.push({
        label: "لوحة التحكم",
        href: "/admin/dashboard",
        current: true,
      });
      return items;
    }

    const subjectCode = pathname.split("/").filter(Boolean).pop();
    if (subjectCode) {
      items.push({
        label: decodeURIComponent(subjectCode).toUpperCase(),
        current: true,
      });
    }

    return items;
  }, [pathname]);

  return (
    <div
      dir="rtl"
      className={`${cairo.className} page-shell lg:grid lg:grid-cols-[260px_1fr]`}
    >
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 inset-s-0 h-screen w-[260px] bg-white border-e border-border z-50 transform transition-transform duration-200 lg:static lg:h-[calc(100vh-64px)]! lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 px-4 border-b border-border flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold text-foreground"
            >
              <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center">
                ش
              </span>
              شيتاتي
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`mb-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive
                      ? "bg-[#eaf2ff] text-primary border border-[#c9dcff]"
                      : "text-foreground hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="lg:hidden h-16 px-4 border-b border-border bg-white flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-foreground">بوابة المواد</span>
          <Link href="/" className="text-primary">
            <Home className="w-5 h-5" />
          </Link>
        </header>

        <main className="section-wrap">
          <nav className="mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex flex-wrap items-center gap-1 bg-[#f7fbff] px-3 py-2 rounded-full border border-[#d9e6f8] text-sm text-muted">
              {breadcrumbs.map((crumb, index) => (
                <li
                  key={`${crumb.label}-${index}`}
                  className="inline-flex items-center gap-1.5"
                >
                  {index > 0 && <span className="text-slate-400">/</span>}
                  {crumb.href && !crumb.current ? (
                    <Link
                      href={crumb.href}
                      className="px-1.5 py-0.5 rounded-md hover:text-primary hover:bg-[#eaf2ff]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        crumb.current
                          ? "text-primary font-semibold px-1.5 py-0.5 rounded-md bg-[#eaf2ff]"
                          : "px-1.5 py-0.5"
                      }
                      aria-current={crumb.current ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
