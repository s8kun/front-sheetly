"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet } from "@/app/types";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  FileText,
  CheckCircle,
  Users,
  BookOpen,
  Clock,
  Plus,
  ExternalLink,
  Check,
  X,
  BarChart3,
  Home,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingSheets, setPendingSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    users: 0,
    subjects: 0,
  });

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", code: "" });
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      const token = Cookies.get("token");

      if (!savedUser || !token) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(savedUser);
      if (user.role?.toLowerCase() !== "admin") {
        router.push("/subjects");
        return;
      }

      fetchData(token);
    };

    checkAuth();
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    try {
      const sheetsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sheets/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const usersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const subjectsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (sheetsRes.ok) {
        const sheetsData = await sheetsRes.json();
        setPendingSheets(sheetsData);
        setStats((prev) => ({ ...prev, pending: sheetsData.length }));
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStats((prev) => ({ ...prev, users: usersData.total || 0 }));
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setStats((prev) => ({ ...prev, subjects: subjectsData.length || 0 }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    setIsAddingSubject(true);

    const subjectData = {
      ...newSubject,
      code: newSubject.code.trim().toUpperCase(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subjects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(subjectData),
        },
      );

      if (res.ok) {
        setNewSubject({ name: "", code: "" });
        setShowAddSubject(false);
        router.push("/subjects");
      } else {
        const data = await res.json();
        alert(data.message || "خطأ في إضافة المادة");
      }
    } catch (err) {
      alert("فشل الاتصال بالسيرفر");
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleAction = async (
    sheetId: number,
    action: "approve" | "reject",
  ) => {
    const token = Cookies.get("token");
    if (!token) return;

    setActionLoading(sheetId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sheets/${sheetId}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        setPendingSheets((prev) => prev.filter((s) => s.id !== sheetId));
        setStats((prev) => ({ ...prev, pending: prev.pending - 1 }));
      } else {
        alert("حدث خطأ أثناء تنفيذ الإجراء");
      }
    } catch (error) {
      console.error(`Failed to ${action} sheet`, error);
    } finally {
      setActionLoading(null);
    }
  };

  // Updated colors to match Academic Blue theme
  const statCards = [
    {
      title: "طلبات معلقة",
      value: stats.pending,
      icon: Clock,
      color: "bg-blue-500",
      shadow: "",
    },
    {
      title: "إجمالي المواد",
      value: stats.subjects,
      icon: BookOpen,
      color: "bg-blue-600 dark:bg-blue-500",
      shadow: " ",
    },
    {
      title: "المستخدمين",
      value: stats.users,
      icon: Users,
      color: "bg-sky-500",
      shadow: "",
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 p-6 md:p-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <nav className="mb-3" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 dark:border-slate-700/60 ">
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
                  <div className="flex items-center">
                    <span className="mx-1 text-slate-400">/</span>
                    <span className="inline-flex items-center text-xs font-bold text-blue-600">
                      لوحة التحكم
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
              لوحة التحكم
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">
              إدارة المنصة والطلبات الجديدة.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddSubject(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-2xl font-bold text-sm    transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة مادة
            </button>
            <Link
              href="/admin/users"
              className="flex-1 md:flex-none px-6 py-3 bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              المستخدمين
            </Link>
            <Link
              href="/"
              className="flex-1 md:flex-none px-6 py-3 bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              الرئيسية
            </Link>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700   flex flex-col gap-4 relative overflow-hidden group transition-colors"
            >
              <div
                className={`absolute top-0 left-0 w-2 h-full ${stat.color}`}
              />
              <div className="flex justify-between items-start">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white  ${stat.shadow}`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {isLoading ? "..." : stat.value}
                </div>
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {stat.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              طلبات الاعتماد المعلقة
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white/50 dark:bg-slate-800/50 animate-pulse rounded-[2rem]"
                />
              ))}
            </div>
          ) : pendingSheets.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {pendingSheets.map((sheet) => (
                  <motion.div
                    key={sheet.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700    transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-300">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">
                            {sheet.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              مستخدم #{sheet.user_id}
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase">
                              {sheet.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <a
                          href={sheet.file_url}
                          target="_blank"
                          className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleAction(sheet.id, "reject")}
                          disabled={actionLoading === sheet.id}
                          className="flex-1 sm:flex-none px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white dark:hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAction(sheet.id, "approve")}
                          disabled={actionLoading === sheet.id}
                          className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-xl font-bold text-sm    hover:bg-blue-700 dark:hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionLoading === sheet.id ? (
                            "..."
                          ) : (
                            <>
                              <Check className="w-5 h-5" /> اعتماد
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 py-20 px-6 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700 text-center transition-colors">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">
                لا توجد طلبات!
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddSubject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSubject(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-md  border border-white/20"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                إضافة مادة جديدة
              </h2>
              <form onSubmit={handleAddSubject} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    اسم المادة
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    رمز المادة (Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject.code}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, code: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all font-mono"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingSubject}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold    transition-colors"
                  >
                    {isAddingSubject ? "جاري..." : "حفظ"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
