"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cairo } from "next/font/google";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Shield,
  User as UserIcon,
  X,
  Check,
  AlertCircle,
  Home,
} from "lucide-react";
import { User } from "@/app/types";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "900"],
});

export default function UsersManagement() {
  const router = useRouter();

  // States
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
    password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndFetch();
  }, [currentPage]);

  const checkAuthAndFetch = () => {
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

    fetchUsers(token);
  };

  const fetchUsers = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        // البيانات تأتي داخل data.data لأنها Paginated
        setUsers(data.data || []);
        setPagination(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (mode: "create" | "edit", user?: User) => {
    setModalMode(mode);
    setError("");
    if (mode === "edit" && user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
        password_confirmation: "",
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        role: "student",
        password: "",
        password_confirmation: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const token = Cookies.get("token");

    const url =
      modalMode === "create"
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser?.id}`;

    const method = modalMode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        fetchUsers(token!);
      } else {
        if (data.errors) {
          setError(Object.values(data.errors).flat()[0] as string);
        } else {
          setError(data.message || "حدث خطأ ما");
        }
      }
    } catch (err) {
      setError("فشل الاتصال بالسيرفر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;

    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        fetchUsers(token!);
      } else {
        const data = await res.json();
        alert(data.message || "فشل حذف المستخدم");
      }
    } catch (error) {
      alert("خطأ في الاتصال");
    }
  };

  return (
    <div
      dir="rtl"
      className={`${cairo.className} min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 md:p-10`}
    >
      {/* Breadcrumb العلوية */}
      <nav className="mb-8 flex justify-start" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm">
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
              <span className="mx-1 text-slate-300">/</span>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                لوحة التحكم
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 text-slate-300">/</span>
              <span className="inline-flex items-center text-xs font-bold text-blue-600">
                <Users className="w-3.5 h-3.5 ml-1.5" />
                إدارة المستخدمين
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            إدارة المستخدمين
          </h1>
          <p className="text-slate-500 dark:text-slate-300">
            عرض وإضافة وتعديل صلاحيات المستخدمين
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          إضافة مستخدم جديد
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-white/90 dark:bg-slate-900/70 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="p-6 font-bold text-slate-600 dark:text-slate-300">
                    المستخدم
                  </th>
                  <th className="p-6 font-bold text-slate-600 dark:text-slate-300">
                    الرتبة
                  </th>
                  <th className="p-6 font-bold text-slate-600 dark:text-slate-300">
                    تاريخ الانضمام
                  </th>
                  <th className="p-6 font-bold text-slate-600 dark:text-slate-300 text-center">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="p-4">
                          <div className="h-12 bg-slate-50 rounded-xl" />
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === "admin" ? "bg-blue-100 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
                            >
                              {user.role === "admin" ? (
                                <Shield className="w-5 h-5" />
                              ) : (
                                <UserIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {user.name}
                              </div>
                              <div className="text-xs text-slate-400 dark:text-slate-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === "admin" ? "bg-blue-50 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
                          >
                            {user.role === "admin" ? "أدمن" : "طالب"}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(user.created_at).toLocaleDateString(
                            "ar-LY",
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal("edit", user)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-20 text-center text-slate-400 dark:text-slate-500 font-medium"
                      >
                        لا يوجد مستخدمين لعرضهم
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 flex justify-center items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                صفحة {currentPage} من {pagination.last_page}
              </span>
              <button
                disabled={currentPage === pagination.last_page}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal إضافة/تعديل مستخدم */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900/90 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {modalMode === "create"
                    ? "إضافة مستخدم جديد"
                    : "تعديل بيانات المستخدم"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    الاسم بالكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                    placeholder="الاسم الثلاثي"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                    placeholder="example@uob.edu.ly"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    الصلاحية
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="student">طالب</option>
                    <option value="admin">أدمن (مدير)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {modalMode === "edit"
                        ? "كلمة المرور الجديدة (اختياري)"
                        : "كلمة المرور"}
                    </label>
                    <input
                      type="password"
                      required={modalMode === "create"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      required={
                        modalMode === "create" || formData.password !== ""
                      }
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password_confirmation: e.target.value,
                        })
                      }
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? "جاري الحفظ..."
                      : modalMode === "create"
                        ? "إنشاء المستخدم"
                        : "حفظ التعديلات"}
                    {!isSubmitting && <Check className="w-5 h-5" />}
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
