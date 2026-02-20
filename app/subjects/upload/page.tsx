"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  fetchJsonWithCache,
  fetchWithRetry,
  invalidateCacheByPrefix,
} from "@/lib/network";
import { toArabicApiError } from "@/lib/api-errors";

interface UploadFormValues {
  title: string;
  subjectId: string;
  type: "chapter" | "midterm" | "final";
  chapterNumber: string;
  file: FileList;
}

/**
 * مكون صفحة رفع الشيتات (UploadPage).
 *
 * يوفر واجهة للطلاب والأدمن لرفع ملفات دراسية جديدة (PDF أو Word).
 * يتضمن نموذجاً لاختيار عنوان الشيت، المادة، ونوع الملف (شابتر، جزئي، نهائي).
 *
 * الحالة (State):
 * - `subjects`: قائمة المواد المتاحة للاختيار في القائمة المنسدلة.
 * - `isLoading`: يشير إلى حالة معالجة الرفع عبر الخادم.
 * - `error`: لتخزين وعرض الأخطاء (صيغة الملف، الحجم المسموح، أخطاء الخادم).
 * - `success`: حالة لعرض رسالة تفيد بنجاح العملية (يتحول شكل المكون).
 *
 * ميزات إضافية:
 * - حفظ مسودة (Draft) المدخلات (في Cookies) أثناء الكتابة ليتم استعادتها إن أغلق المستخدم الصفحة.
 * - إرسال الملف باستخدام `FormData` ورفعها لنقطة `sheets/upload`.
 * - التحقق من وجود رمز `XSRF-TOKEN` لحماية الطلبات.
 * - استخدام `invalidateCacheByPrefix` لمسح الكاش وتحديث عرض الملفات فوراً في التطبيق.
 *
 * @returns {JSX.Element} واجهة رفع الملفات.
 */
export default function UploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<
    { id: number; name: string; code: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    defaultValues: {
      title: "",
      subjectId: "",
      type: "chapter",
      chapterNumber: "",
    },
  });

  const title = watch("title");
  const subjectId = watch("subjectId");
  const type = watch("type");
  const chapterNumber = watch("chapterNumber");
  const selectedFile = watch("file")?.[0];

  // 1. استعادة البيانات عند التحميل
  useEffect(() => {
    const savedData = Cookies.get("upload-form-cache");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setValue("title", parsed.title || "");
        setValue("subjectId", parsed.subjectId || "");
        setValue("type", parsed.type || "chapter");
        setValue("chapterNumber", parsed.chapterNumber || "");
      } catch {
        Cookies.remove("upload-form-cache");
      }
    }

    const fetchSubjects = async () => {
      try {
        const data = await fetchJsonWithCache<
          { id: number; name: string; code: string }[]
        >(
          "subjects:upload:list",
          async () => {
            const res = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_API_URL}/subjects`,
              {
                credentials: "include",
              },
              { retries: 2, retryDelayMs: 600 },
            );

            if (!res.ok) throw new Error("Failed subjects fetch");
            return res.json();
          },
          120_000,
        );

        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };

    fetchSubjects();
  }, [setValue]);

  // 2. حفظ البيانات تلقائياً عند أي تغيير
  useEffect(() => {
    const formData = { title, subjectId, type, chapterNumber };
    Cookies.set("upload-form-cache", JSON.stringify(formData), {
      expires: 1,
      sameSite: "strict",
      secure: true,
    });
  }, [title, subjectId, type, chapterNumber]);

  const onSubmit = async (values: UploadFormValues) => {
    setIsLoading(true);
    setError("");
    const file = values.file?.[0];
    if (!file) {
      setError("اختار ملف قبل ما ترفع");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("subject_id", values.subjectId);
    formData.append("type", values.type);
    formData.append("file", file);
    if (values.chapterNumber?.trim()) {
      formData.append("chapter_number", values.chapterNumber.trim());
    }

    // Debug: Log FormData contents
    console.log("Sending Data:");
    formData.forEach((value, key) => console.log(`${key}:`, value));

    const token = Cookies.get("token");
    const csrfToken = Cookies.get("XSRF-TOKEN");

    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = csrfToken;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sheets/upload`,
        {
          method: "POST",
          credentials: "include",
          headers: headers,
          body: formData,
        },
      );

      const data = await res.json();
      console.log("API Response Status:", res.status);
      console.log("API Response Data:", data);

      if (res.ok) {
        invalidateCacheByPrefix([
          "my-sheets:",
          "subject:detail:",
          "subjects:list:",
          "admin:pending:",
        ]);
        setSuccess(true);
        Cookies.remove("upload-form-cache");
        setTimeout(() => router.push("/subjects/my-sheets"), 2000);
      } else {
        if (res.status === 413 || res.status === 500) {
          setError(
            "فشل الرفع. يبدو أن حجم الملف يتجاوز الحد المسموح به من قبل الخادم (Server Limit).",
          );
        } else {
          setError(
            toArabicApiError(
              data.message,
              "حدث خطأ أثناء الرفع، يرجى المحاولة لاحقاً",
            ),
          );
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("فشل الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="panel p-6 md:p-8">
        <header className="text-center mb-8">
          <div className="w-14 h-14 bg-[#eaf2ff] rounded-lg flex items-center justify-center text-primary mx-auto mb-4 border border-[#c9dcff]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-foreground">رفع شيت جديد</h1>
          <p className="text-muted mt-2 text-sm">
            ارفع الملف في المكان الصحيح باش يستفيدوا منه الطلبة
          </p>
        </header>

        {success ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              تم الرفع بنجاح!
            </h2>
            <p className="text-muted mt-2">ملفك وصل للإدارة وباقي المراجعة.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <div className="status-error">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                عنوان الشيت
              </label>
              <input
                type="text"
                {...register("title", {
                  required: "الحقل هذا ضروري",
                  minLength: {
                    value: 3,
                    message: "اكتب عنوان أوضح شوي",
                  },
                  onChange: () => setError(""),
                })}
                className="field"
                placeholder="مثال: شابتر 1 - ميكانيكا 2"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  المادة
                </label>
                <select
                  {...register("subjectId", {
                    required: "اختار المادة",
                    onChange: () => setError(""),
                  })}
                  className="select"
                >
                  <option value="">اختر المادة</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
                {errors.subjectId && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.subjectId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  نوع الملف
                </label>
                <select
                  {...register("type", {
                    required: "اختار نوع الملف",
                    onChange: () => setError(""),
                  })}
                  className="select"
                >
                  <option value="chapter">شابتر</option>
                  <option value="midterm">جزئي</option>
                  <option value="final">نهائي</option>
                </select>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-foreground mb-2">
                اختر الملف (PDF أو DOCX)
              </label>
              <label className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-border border-dashed rounded-lg hover:border-[#b8cff3] hover:bg-[#f8fbff] transition-all cursor-pointer group">
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx,.doc"
                  {...register("file", {
                    required: "الحقل هذا ضروري",
                    validate: {
                      fileType: (files) => {
                        const file = files?.[0];
                        if (!file) return "الحقل هذا ضروري";
                        const allowedTypes = [
                          "application/pdf",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          "application/msword",
                        ];
                        return (
                          allowedTypes.includes(file.type) ||
                          "اختار ملف PDF ولا DOCX"
                        );
                      },
                      fileSize: (files) => {
                        const file = files?.[0];
                        if (!file) return "الحقل هذا ضروري";
                        return (
                          file.size <= 10 * 1024 * 1024 ||
                          "حجم الملف كبير، خليه أقل من 10 ميقا"
                        );
                      },
                    },
                    onChange: () => setError(""),
                  })}
                />
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#eaf2ff] transition-all">
                    <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-primary" />
                  </div>
                  <div className="text-sm text-muted">
                    <span className="font-black text-primary">
                      اضغط لرفع الملف
                    </span>
                    <span className="ms-1">أو اسحب وأفلت هنا</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedFile ? (
                      <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                        تم اختيار: {selectedFile.name}
                      </span>
                    ) : (
                      "PDF أو DOCX (حتى 10 ميجابايت)"
                    )}
                  </p>
                </div>
              </label>
              {errors.file && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.file.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-black text-white ${
                isLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {isLoading ? "جاري الرفع..." : "تأكيد الرفع"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
