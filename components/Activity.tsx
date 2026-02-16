// src/components/Activity.tsx
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityItem from "./ActivityItem";
import { Sheet } from "@/app/types";

interface ActivityProps {
  items: Sheet[];
  type: "file" | "exam";
  emptyMessage?: string;
}

const Activity = memo(
  ({ items, type, emptyMessage = "لا يوجد محتوى لعرضه" }: ActivityProps) => {
    return (
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-auto"
      >
        <AnimatePresence mode="popLayout">
          {items && items.length > 0 ? (
            items.map((item) => (
              <ActivityItem key={item.id} item={item} type={type} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-300 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p>{emptyMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

Activity.displayName = "Activity";
export default Activity;
