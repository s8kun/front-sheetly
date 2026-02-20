"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (
    message: string,
    type?: ToastType,
    durationMs?: number,
    action?: { label: string; onClick: () => void },
  ) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * مكون المزود (Provider) للإشعارات المنبثقة (Toasts).
 *
 * يغلف التطبيق ليوفر سياق (Context) يسمح لأي مكون آخر بعرض إشعارات مؤقتة
 * للنجاح، الخطأ، أو المعلومات، بالإضافة إلى دعم الإشعارات التي تحتوي على أزرار تفاعلية (Actions).
 *
 * @param {Object} props - خصائص المكون (الأبناء `children`).
 * @returns {JSX.Element} المزود مع حاوية عرض الإشعارات.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (
    message: string,
    type: ToastType = "info",
    durationMs = 2800,
    action?: { label: string; onClick: () => void },
  ) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        actionLabel: action?.label,
        onAction: action?.onClick,
      },
    ]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, durationMs);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-300 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className={`mb-2 rounded-lg border px-4 py-3 shadow-sm pointer-events-auto text-sm font-semibold ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : toast.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{toast.message}</span>
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onAction?.();
                      setToasts((prev) =>
                        prev.filter((item) => item.id !== toast.id),
                      );
                    }}
                    className="text-xs font-black underline"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * خطاف (Hook) مخصص للوصول إلى دالة `showToast` لعرض الإشعارات.
 *
 * يجب استخدامه داخل أي مكون يقع تحت `ToastProvider`.
 *
 * @returns {ToastContextValue} الكائن الذي يحتوي على دالة `showToast`.
 * @throws {Error} إذا تم استخدامه خارج المزود.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
