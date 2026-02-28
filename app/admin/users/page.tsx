"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Users,
  UserPlus,
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
import { useToast } from "@/components/ToastProvider";
import { toArabicApiError } from "@/lib/api-errors";
import { useForm } from "react-hook-form";

interface UserFormValues {
  name: string;
  email: string;
  role: string;
  password?: string;
  password_confirmation?: string;
}

/**
 * مكون صفحة إدارة المستخدمين (UsersManagement).
 *
 * لوحة تحكم مخصصة للأدمن فقط، تتيح عرض جميع المستخدمين (طلاب ومدراء)
 * في شكل جدول مع دعم تقسيم الصفحات (Pagination). يتيح المكون أيضاً
 * وظائف إضافة مستخدم جديد، تعديل بيانات/كلمة مرور مستخدم قائم، وحذفه كلياً.
 *
 * الحالة (State):
 * - `users`: مصفوفة المستخدمين المعروضين في الصفحة الحالية.
 * - `pagination`: بيانات التقسيم، مثل رقم الصفحة النهائية لمعرفة حدود التنقل.
 * - `isLoading`: لتمكين تأثير تحميل الهيكل العظمي للجدول.
 * - `currentPage`: الصفحة المعروضة حالياً، وتغيرها يعيد جلب البيانات.
 * - `showModal` & `modalMode`: متغيرات للتحكم بظهور النافذة المنبثقة (Modal) ومعرفة الغرض منها (إنشاء أو تعديل).
 * - `selectedUser`: يخزن بيانات المستخدم المحدد أثناء التعديل.
 * - `formData`: كائن يحتوي على حقول الإدخال الحية لنموذج إضافة/تعديل المستخدم.
 *
 * الميزات:
 * - التحقق الإجباري من أذونات المستخدم `role === "admin"` وتوجيهه بخلاف ذلك.
 * - ربط تلقائي برسائل الـ Toast المخصصة لإعلام المدير بنجاح أو فشل العمليات.
 *
 * @returns {JSX.Element} واجهة إدارة حسابات الطلاب والمدراء.
 */
export default function UsersManagement() {
  const router = useRouter();
  const { showToast } = useToast();

  // States
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<{ last_page: number } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      password: "",
      password_confirmation: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const checkAuthAndFetch = () => {
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

    fetchUsers(token);
  };

  const fetchUsers = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        // البيانات تأتي داخل data.data لأنها Paginated
        setUsers(data.data || []);
        setPagination(data);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (mode: "create" | "edit", user?: User) => {
    setModalMode(mode);
    setError("");
    if (mode === "edit" && user) {
      setSelectedUser(user);
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
        password_confirmation: "",
      });
    } else {
      setSelectedUser(null);
      reset({
        name: "",
        email: "",
        role: "student",
        password: "",
        password_confirmation: "",
      });
    }
    setShowModal(true);
  };

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setError("");
    const token = Cookies.get("token");

    const url =
      modalMode === "create"
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser?.id}`;

    const method = modalMode === "create" ? "POST" : "PUT";

    try {
      const payload: Record<string, string> = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (data.password && data.password_confirmation) {
        payload.password = data.password;
        payload.password_confirmation = data.password_confirmation;
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        setShowModal(false);
        fetchUsers(token!);
        showToast(
          modalMode === "create" ? "تم إنشاء المستخدم" : "تم تحديث المستخدم",
          "success",
        );
      } else {
        if (responseData.errors) {
          setError(
            toArabicApiError(
              Object.values(responseData.errors).flat()[0] as string,
              "حدث خطأ في البيانات.",
            ),
          );
        } else {
          setError(toArabicApiError(responseData.message, "حدث خطأ ما"));
        }
      }
    } catch {
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
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (res.ok) {
        fetchUsers(token!);
        showToast("تم حذف المستخدم", "success");
      } else {
        const data = await res.json();
        showToast(toArabicApiError(data.message, "فشل حذف المستخدم"), "error");
      }
    } catch {
      showToast("خطأ في الاتصال", "error");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen page-shell p-6 md:p-10">
      {/* Breadcrumb العلوية */}
      <nav className="mb-8 flex justify-start" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-[#f7fbff] px-4 py-2 rounded-full border border-[#d9e6f8]">
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
              <span className="mx-1 text-slate-300">/</span>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center text-xs font-bold text-muted hover:text-primary"
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

      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">
            إدارة المستخدمين
          </h1>
          <p className="text-muted">عرض وإضافة وتعديل صلاحيات المستخدمين</p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover"
        >
          <UserPlus className="w-5 h-5" />
          إضافة مستخدم جديد
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="p-6 font-bold text-muted">المستخدم</th>
                  <th className="p-6 font-bold text-muted">الرتبة</th>
                  <th className="p-6 font-bold text-muted">تاريخ الانضمام</th>
                  <th className="p-6 font-bold text-muted text-center">
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
                      <m.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === "admin" ? "bg-blue-100 text-primary" : "bg-slate-100 text-slate-600"}`}
                            >
                              {user.role === "admin" ? (
                                <Shield className="w-5 h-5" />
                              ) : (
                                <UserIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">
                                {user.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === "admin" ? "bg-blue-50 text-primary" : "bg-slate-100 text-slate-600"}`}
                          >
                            {user.role === "admin" ? "أدمن" : "طالب"}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-muted">
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
                      </m.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-20 text-center text-slate-500 font-medium"
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
            <div className="p-6 bg-slate-50 flex justify-center items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 bg-white border border-border rounded-lg disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-muted">
                صفحة {currentPage} من {pagination.last_page}
              </span>
              <button
                disabled={currentPage === pagination.last_page}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 bg-white border border-border rounded-lg disabled:opacity-30 hover:bg-slate-50"
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
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40"
            />
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-foreground">
                  {modalMode === "create"
                    ? "إضافة مستخدم جديد"
                    : "تعديل بيانات المستخدم"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
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

              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    الاسم بالكامل
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "يرجى كتابة الاسم" })}
                    className="field"
                    placeholder="الاسم الثلاثي"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "البريد الإلكتروني مطلوب",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "صيغة البريد غير صحيحة",
                      },
                    })}
                    className="field"
                    placeholder="itstd.0000@uob.edu.ly"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    الصلاحية
                  </label>
                  <select {...register("role")} className="select font-bold">
                    <option value="student">طالب</option>
                    <option value="admin">أدمن (مدير)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">
                      {modalMode === "edit"
                        ? "كلمة المرور الجديدة (اختياري)"
                        : "كلمة المرور"}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      {...register("password", {
                        required:
                          modalMode === "create" ? "كلمة المرور مطلوبة" : false,
                        minLength: {
                          value: 8,
                          message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
                        },
                      })}
                      className="field font-sans"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      {...register("password_confirmation", {
                        validate: (value) => {
                          if (modalMode === "create" && !value)
                            return "تأكيد كلمة المرور مطلوب";
                          if (watch("password") && value !== watch("password"))
                            return "كلمتا المرور غير متطابقتين";
                          return true;
                        },
                      })}
                      className="field font-sans"
                      placeholder="••••••••"
                    />
                    {errors.password_confirmation && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-foreground rounded-lg font-bold text-sm hover:bg-slate-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
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
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
