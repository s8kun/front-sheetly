"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sheet } from "@/app/types";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { FileText, Trash2, Download, Folder } from "lucide-react";

interface ActivityItemProps {
  item: Sheet & {
    isLazy?: boolean;
    chapterNumber?: number;
    isFolder?: boolean;
  };
  type: "file" | "exam";
}

const ActivityItem = memo(({ item, type }: ActivityItemProps) => {
  const params = useParams();
  const isFolder = item.isFolder;
  const [count, setCount] = useState(item.downloads_count || 0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = Cookies.get("token");

    if (item.isLazy && item.chapterNumber) {
      // حالة حذف "شابتر" (عبارة عن رقم)
      if (
        !confirm(
          `هل أنت متأكد من حذف الشابتر ${item.chapterNumber} بجميع ملفاته؟`,
        )
      )
        return;

      setIsDeleting(true);
      try {
        // 1. جلب الملفات داخل الشابتر
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subjects/${params.code}/chapters/${item.chapterNumber}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (data.sheets && data.sheets.length > 0) {
            // 2. حذف كل الملفات واحداً تلو الآخر
            const deletePromises = data.sheets.map((s: any) =>
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/sheets/${s.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
              }),
            );
            await Promise.all(deletePromises);
            window.location.reload();
          } else {
            alert("الشابتر فارغ بالفعل");
          }
        }
      } catch (err) {
        console.error("Delete chapter error:", err);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // حالة حذف ملف حقيقي (له ID)
      if (!confirm("هل أنت متأكد من حذف هذا الملف نهائياً؟")) return;
      setIsDeleting(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sheets/${item.id}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Delete sheet error:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (isFolder) return "مجلد";
    if (!dateString) return "جديد";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "جديد" : date.toLocaleDateString("en-GB");
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading || isFolder || isDeleting) return;

    setIsDownloading(true);
    const token = Cookies.get("token");
    try {
      let urlToOpen = item.file_url;
      let finalId = item.id;

      if (item.isLazy && item.chapterNumber) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subjects/${params.code}/chapters/${item.chapterNumber}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.sheets && data.sheets.length > 0) {
            urlToOpen = data.sheets[0].file_url;
            finalId = data.sheets[0].id;
            // تحديث العداد بالقيمة الحقيقية القادمة من الداتا بيز للملف
            setCount(data.sheets[0].downloads_count || 0);
          } else {
            alert("لا توجد ملفات في هذا الشابتر بعد");
            setIsDownloading(false);
            return;
          }
        }
      }

      const resDownload = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sheets/${finalId}/download`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resDownload.ok) {
        const data = await resDownload.json();
        window.open(data.download_url, "_blank");

        // هنا نستخدم القيمة الجديدة للعداد من استجابة السيرفر إذا كانت متوفرة، أو نزيدها يدوياً
        // بما أن الـ API الحالي للـ download لا يعيد العداد الجديد، سنزيد العداد المحلي بواحد
        setCount((prev) => prev + 1);
      } else {
        window.open(urlToOpen, "_blank");
      }
    } catch (error) {
      if (item.file_url) window.open(item.file_url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative border p-4 rounded-[2rem] shadow-sm transition-all cursor-pointer ${
        isDeleting
          ? "opacity-50 grayscale"
          : "bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/40"
      }`}
    >
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute -top-2 -left-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:scale-110 transition-all disabled:bg-slate-400"
          title="حذف"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
            type === "file" ? "bg-blue-600" : "bg-sky-500"
          }`}
        >
          {isFolder ? (
            <Folder className="w-6 h-6" />
          ) : type === "file" ? (
            <FileText className="w-6 h-6" />
          ) : (
            <FileText className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold">
            {item.isLazy ? "اضغط للتحميل المباشر" : formatDate(item.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          {!isFolder && (
            <>
              <Download className="w-4 h-4 text-slate-400" />
              {count}
            </>
          )}
        </span>

        <button
          onClick={handleDownload}
          disabled={isDownloading || isDeleting}
          className={`text-xs px-4 py-2 rounded-xl font-black transition-all ${
            isDownloading || isDeleting
              ? "bg-slate-200 text-slate-400"
              : "bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-200"
          }`}
        >
          {isDownloading ? "جاري..." : "تحميل"}
        </button>
      </div>
    </motion.div>
  );
});

ActivityItem.displayName = "ActivityItem";
export default ActivityItem;
