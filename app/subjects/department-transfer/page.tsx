"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { ArrowRightLeft, FileWarning, ClipboardList } from "lucide-react";

export default function DepartmentTransferPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Header Section */}
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="bg-[#eaf2ff] text-primary border border-[#c9dcff] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-4 inline-block">
          دليل الطالب
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 flex justify-center items-center gap-3">
          <ArrowRightLeft
            className="w-8 h-8 md:w-10 md:h-10 text-primary"
            strokeWidth={2.5}
          />
          النقل بين الأقسام العلمية
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          دليلك الشامل لمعرفة شروط وضوابط الانتقال من قسم علمي إلى آخر داخل
          الكلية.
        </p>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Key Info / Instructions Section */}
        <div className="lg:col-span-2 space-y-6">
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#f0f6ff] p-2.5 rounded-xl text-primary">
                <FileWarning className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-foreground">
                إعلان للطلبة
              </h2>
            </div>

            <p className="text-foreground/80 leading-relaxed font-medium mb-6">
              على الطلبة الراغبين في الانتقال بين الأقسام العلمية: بحسب لائحة
              الدراسة المعتمدة في الكلية، يجوز للطالب أن ينتقل من قسمه إلى قسم
              آخر بمراعاة الشروط الواردة في اللائحة.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="flex items-center gap-2 font-bold text-foreground mb-3">
                <ClipboardList className="w-5 h-5 text-slate-500" />
                المطلوب لإتمام النقل:
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 font-medium list-disc list-inside">
                <li>تعبئة طلب الانتقال بين الأقسام كتابياً.</li>
                <li>تقديم الطلب عند مسجل الكلية.</li>
                <li>إرفاق طلب النقل بنسخة من النتيجة للفصل الماضي.</li>
              </ul>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary text-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="font-black text-lg mb-2">ملاحظة هامة</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              تأكد من قراءة الشروط والضوابط الموضحة في الصورة المرفقة بعناية قبل
              التقديم على طلب النقل وتأكد من استيفائك لكافة الشروط لتجنب رفض
              الطلب.
            </p>
          </m.div>
        </div>

        {/* Image / Regulations Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white p-2 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-3/4 sm:aspect-auto sm:h-[600px] w-full rounded-xl overflow-hidden bg-slate-50">
              <Image
                src="/image/trans.png"
                alt="لائحة الشروط للنقل بين الأقسام"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain object-top"
                priority
              />
            </div>
            <div className="p-4 text-center">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                صورة ضوئية لضوابط اللائحة المعتمدة
              </span>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}
