"use client";

import { m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function TransferGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 page-shell" dir="rtl">
      {/* Navbar/Header Simple for Public Page */}
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-foreground hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
              ش
            </span>
            <span>شيتاتي</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-bold text-muted hover:text-primary flex items-center gap-1 whitespace-nowrap"
          >
            <span>العودة للرئيسية</span> <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Main Poster Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-20 flex flex-col items-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Decorative Header badge */}
          <div className="text-center mb-6">
            <span className="inline-block bg-[#eaf2ff] text-primary border border-[#c9dcff] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-2">
              شروط الانتقال والمعادلة 🎓
            </span>
          </div>

          {/* The Poster Image */}
          <div className="bg-white p-2 rounded-2xl md:rounded-3xl shadow-lg border border-border w-full">
            <div className="relative w-full aspect-3/4 sm:aspect-4/5 md:h-[800px] md:aspect-auto rounded-xl md:rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src="/image/trans_college.png"
                alt="شروط المعادلة والانتقال من الكليات الأخرى"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </m.div>
      </main>
    </div>
  );
}
