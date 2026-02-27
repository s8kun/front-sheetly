"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { Percent } from "lucide-react";

export default function GradePercentagePage() {
  return (
    <div>
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 bg-[#eaf2ff] text-primary border border-[#c9dcff] px-3 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4">
          <Percent className="w-4 h-4" />
          جدول الدرجات والتقديرات
        </span>
        <h1 className="text-3xl font-black text-foreground mb-3">
          النسبة المئوية للدرجات
        </h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          الجدول الرسمي لتحويل الدرجات المئوية إلى تقديرات وساعات نقاط جامعة
          بنغازي.
        </p>
      </m.div>

      <m.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <p className="text-sm text-muted leading-relaxed">
            يوضح الجدول أدناه التقديرات المعتمدة في الجامعة مع قيمتها من حيث
            ساعات النقاط المستخدمة في حساب المعدل التراكمي.
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <Image
            src="/image/nesba.png"
            alt="جدول النسبة المئوية للدرجات والتقديرات"
            width={900}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </m.div>
    </div>
  );
}
