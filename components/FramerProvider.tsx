"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * مزود حركات Framer Motion المُحسّن.
 *
 * يستخدم LazyMotion مع domAnimation لتحميل فقط ميزات الحركة المطلوبة
 * بدلاً من تحميل الحزمة الكاملة (~60kb → ~15kb).
 */
export default function FramerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
