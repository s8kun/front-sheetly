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
  RefreshCw,
} from "lucide-react";
import {
  fetchJsonWithCache,
  fetchWithRetry,
  invalidateCacheByPrefix,
} from "@/lib/network";
import { useToast } from "@/components/ToastProvider";
import { toArabicApiError } from "@/lib/api-errors";

/**
 * مكون صفحة تحكم الإدارة (AdminDashboard).
 *
 * يوفر للأدمن نظرة عامة على إحصائيات المنصة (عدد الطلبات المعلقة، المواد، والمستخدمين)
 * ويتيح اتخاذ قرارات فورية بقبول أو رفض الشيتات المعلقة المرفوعة من الطلاب.
 * يتيح أيضاً إضافة مواد دراسية جديدة (Subjects).
 *
 * الحالة (State):
 * - `pendingSheets`: مصفوفة الشيتات التي تنتظر المراجعة.
 * - `isLoading` & `isRefreshing`: للتحكم في رسوم التحميل والتحديث اليدوي.
 * - `actionLoading`: لتتبع الزر الذي تم الضغط عليه (قبول/رفض) وتعطيله مؤقتاً.
 * - `stats`: كائن يحتوي على أرقام الإحصائيات لعرضها في البطاقات العلوية.
 * - `showAddSubject`, `newSubject`, `isAddingSubject`: للتحكم في نموذج إضافة المادة المنبثق (Modal).
 * - `lastUpdated`: يخزن وقت آخر تحديث للبيانات بواجهة المستخدم.
 *
 * الميزات:
 * - تحقق آمن من دور `admin` عبر الكوكيز وإرجاع المستخدم للمواد إن لم يملك الصلاحية.
 * - تحديث الكاش وإلغاء صلاحيته (`invalidateCacheByPrefix`) لضمان تزامن البيانات مع السيرفر بعد أي اكشن.
 *
 * @returns {JSX.Element} واجهة لوحة تحكم الإدارة.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = Cookies.get("user");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchData = async (token: string, useLoading = true) => {
    if (useLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const pendingPromise = fetchJsonWithCache<Sheet[]>(
        `admin:pending:${token.slice(0, 12)}`,
        async () => {
          const res = await fetchWithRetry(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/sheets/pending`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!res.ok) throw new Error("pending failed");
          return res.json();
        },
        20_000,
      );

      const usersPromise = fetchJsonWithCache<{ total?: number }>(
        `admin:users:count:${token.slice(0, 12)}`,
        async () => {
          const res = await fetchWithRetry(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!res.ok) throw new Error("users failed");
          return res.json();
        },
        120_000,
      );

      const subjectsPromise = fetchJsonWithCache<{ id: number }[]>(
        `admin:subjects:${token.slice(0, 12)}`,
        async () => {
          const res = await fetchWithRetry(
            `${process.env.NEXT_PUBLIC_API_URL}/subjects`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!res.ok) throw new Error("subjects failed");
          return res.json();
        },
        120_000,
      );

      const [sheetsData, usersData, subjectsData] = await Promise.all([
        pendingPromise,
        usersPromise,
        subjectsPromise,
      ]);

      setPendingSheets(sheetsData || []);
      setStats({
        pending: sheetsData?.length || 0,
        users: usersData?.total || 0,
        subjects: subjectsData?.length || 0,
      });
      setLastUpdated(new Date().toLocaleTimeString("ar-LY"));
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      showToast("تعذر تحميل بيانات لوحة التحكم.", "error", 3500, {
        label: "إعادة المحاولة",
        onClick: () => fetchData(token, false),
      });
    } finally {
      if (useLoading) setIsLoading(false);
      else setIsRefreshing(false);
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
        if (token) {
          invalidateCacheByPrefix([
            "admin:subjects:",
            "subjects:list:",
            "subjects:upload:list",
          ]);
          fetchData(token, false);
          showToast("تمت إضافة المادة بنجاح", "success");
        }
      } else {
        const data = await res.json();
        showToast(
          toArabicApiError(data.message, "خطأ في إضافة المادة"),
          "error",
        );
      }
    } catch {
      showToast("فشل الاتصال بالسيرفر", "error");
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
        invalidateCacheByPrefix([
          "admin:pending:",
          "my-sheets:",
          "subject:detail:",
        ]);
        showToast(
          action === "approve" ? "تم اعتماد الملف" : "تم رفض الملف",
          "success",
        );
      } else {
        showToast("حدث خطأ أثناء تنفيذ الإجراء", "error");
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
      color: "bg-blue-600",
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
    <div dir="rtl" className="min-h-screen page-shell p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="panel p-5 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <nav className="mb-3" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-[#f7fbff] px-3 py-1.5 rounded-full border border-[#d9e6f8]">
                  <li className="inline-flex items-center">
                    <Link
                      href="/"
                      className="inline-flex items-center text-xs font-bold text-muted hover:text-primary"
                    >
                      <Home className="w-3.5 h-3.5 ml-1.5" />
                      الرئيسية
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <span className="mx-1 text-slate-400">/</span>
                      <span className="inline-flex items-center text-xs font-bold text-primary">
                        لوحة التحكم
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                لوحة التحكم
              </h1>
              <p className="text-muted mt-1 font-medium">
                إدارة المنصة والطلبات الجديدة.
              </p>
              <p className="text-xs text-muted mt-2">
                آخر تحديث: {lastUpdated || "-"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  const token = Cookies.get("token");
                  if (token) {
                    invalidateCacheByPrefix([
                      "admin:pending:",
                      "admin:users:count:",
                      "admin:subjects:",
                    ]);
                    fetchData(token, false);
                  }
                }}
                disabled={isRefreshing}
                className="flex-1 md:flex-none px-5 py-3 bg-white border border-border rounded-lg text-sm font-bold text-foreground hover:bg-slate-50 inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                تحديث
              </button>
              <button
                onClick={() => setShowAddSubject(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة مادة
              </button>
              <Link
                href="/admin/users"
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-border rounded-lg text-sm font-bold text-foreground hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5 text-slate-500" />
                المستخدمين
              </Link>
              <Link
                href="/subjects"
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-border rounded-lg text-sm font-bold text-foreground hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5 text-slate-500" />
                المواد
              </Link>
            </div>
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
              className="bg-white p-6 rounded-lg border border-border flex flex-col gap-4 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 start-0 w-2 h-full ${stat.color}`}
              />
              <div className="flex justify-between items-start">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white  ${stat.shadow}`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-foreground">
                  {isLoading ? "..." : stat.value}
                </div>
                <div className="text-sm font-bold text-muted mt-1">
                  {stat.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              طلبات الاعتماد المعلقة
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white animate-pulse rounded-lg border border-border"
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
                    className="bg-white p-5 rounded-lg border border-border"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">
                            {sheet.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-bold text-muted">
                              مستخدم #{sheet.user_id}
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-[#eaf2ff] px-2 py-0.5 rounded-full uppercase">
                              {sheet.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <a
                          href={sheet.file_url}
                          target="_blank"
                          className="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleAction(sheet.id, "reject")}
                          disabled={actionLoading === sheet.id}
                          className="flex-1 sm:flex-none px-5 py-3 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAction(sheet.id, "approve")}
                          disabled={actionLoading === sheet.id}
                          className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="bg-white py-20 px-6 rounded-lg border border-dashed border-border text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">
                لا توجد طلبات!
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddSubject && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSubject(false)}
              className="absolute inset-0 bg-slate-900/40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-lg p-8 w-full max-w-md border border-border"
            >
              <h2 className="text-2xl font-black text-foreground mb-6">
                إضافة مادة جديدة
              </h2>
              <form onSubmit={handleAddSubject} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    اسم المادة
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    رمز المادة (Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject.code}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, code: e.target.value })
                    }
                    className="field font-mono"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="flex-1 py-4 bg-slate-100 text-foreground rounded-lg font-bold hover:bg-slate-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingSubject}
                    className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold"
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
