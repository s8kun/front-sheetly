/**
 * مكون التحميل الاحتياطي (Loading).
 *
 * يظهر هذا المكون تلقائياً من قبل Next.js أثناء الانتقال بين المسارات أو
 * عند جلب بيانات المكونات على الخادم (Server Components). يوفر تجربة مستخدم أفضل
 * بدلاً من تجمد الشاشة.
 *
 * @returns {JSX.Element} شاشة تحميل مركزية مع تأثير حركة خافت (Pulse).
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white">
      <div className="panel w-[320px] p-8 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-lg bg-primary text-white font-black text-2xl flex items-center justify-center">
          ش
        </div>
        <p className="text-sm font-semibold text-foreground">جاري التحميل...</p>
        <div className="w-full h-2 mt-4 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
