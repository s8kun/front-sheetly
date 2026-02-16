"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle } from "lucide-react";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

export default function UploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<
    { id: number; name: string; code: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [type, setType] = useState("chapter");
  const [chapterNumber, setChapterNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // 1. استعادة البيانات عند التحميل
  useEffect(() => {
    const savedData = localStorage.getItem("upload-form-cache");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTitle(parsed.title || "");
      setSubjectId(parsed.subjectId || "");
      setType(parsed.type || "chapter");
      setChapterNumber(parsed.chapterNumber || "");
    }

    // Fetch subjects
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Error fetching subjects", err));
  }, []);

  // 2. حفظ البيانات تلقائياً عند أي تغيير
  useEffect(() => {
    const formData = { title, subjectId, type, chapterNumber };
    localStorage.setItem("upload-form-cache", JSON.stringify(formData));
  }, [title, subjectId, type, chapterNumber]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("عذراً، يسمح فقط بملفات PDF و DOCX");
        setFile(null);
        e.target.value = "";
        return;
      }
      // 10MB limit check (10 * 1024 * 1024)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("عذراً، حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.");
        setFile(null);
        e.target.value = "";
        return;
      }

      setError("");
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !subjectId || !title) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject_id", subjectId);
    formData.append("type", type);
    formData.append("file", file);
    if (chapterNumber) formData.append("chapter_number", chapterNumber);

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
        setSuccess(true);
        localStorage.removeItem("upload-form-cache");
        setTimeout(() => router.push("/subjects/my-sheets"), 2000);
      } else {
        if (res.status === 413 || res.status === 500) {
          setError(
            "فشل الرفع. يبدو أن حجم الملف يتجاوز الحد المسموح به من قبل الخادم (Server Limit).",
          );
        } else {
          setError(data.message || "حدث خطأ أثناء الرفع، يرجى المحاولة لاحقاً");
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
    <div className={`max-w-2xl mx-auto py-10 px-6 ${cairo.className}`}>
      <div className="bg-white/90 dark:bg-slate-900/70 rounded-3xl p-8  border border-slate-200 dark:border-slate-700">
        <header className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            ساهم في نشر المعرفة
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-2 text-sm">
            برفعك لهذا الشيت، أنت تساعد زملائك وتسهل عليهم رحلتهم الدراسية 🌟
          </p>
        </header>

        {success ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              تم الرفع بنجاح!
            </h2>
            <p className="text-slate-500 dark:text-slate-300 mt-2">
              سيتم مراجعة الملف من قبل الإدارة والموافقة عليه قريباً.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                عنوان الشيت
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder="مثال: شابتر 1 - ميكانيكا 2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  المادة
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="">اختر المادة</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  نوع الملف
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="chapter">شابتر</option>
                  <option value="midterm">جزئي</option>
                  <option value="final">نهائي</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                اختر الملف (PDF أو DOCX)
              </label>
              <label className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-4xl hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-all cursor-pointer group">
                <input
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc"
                />
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-black text-blue-600">
                      اضغط لرفع الملف
                    </span>
                    <span className="mr-1">أو اسحب وأفلت هنا</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {file ? (
                      <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                        تم اختيار: {file.name}
                      </span>
                    ) : (
                      "PDF أو DOCX (حتى 10 ميجابايت)"
                    )}
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white  transition-all ${
                isLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] "
              }`}
            >
              {isLoading ? "جاري الرفع..." : "تأكيد الرفع والمساهمة"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
