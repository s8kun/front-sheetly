"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { fetchJsonWithCache, fetchWithRetry } from "@/lib/network";
import { Subject } from "@/app/types";

const UI_COLORS = [
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-blue-600",
  "bg-sky-600",
  "bg-cyan-600",
  "bg-blue-400",
  "bg-sky-400",
  "bg-cyan-400",
  "bg-blue-700",
];

interface SubjectsContextType {
  subjects: Subject[];
  isLoading: boolean;
  error: string;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(
  undefined,
);

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchSubjects = async () => {
      setIsLoading(true);
      setError("");
      const token = Cookies.get("token");
      try {
        const cacheKey = `subjects:all:list:${(token || "guest").slice(0, 12)}`;
        const data = await fetchJsonWithCache<Subject[]>(
          cacheKey,
          async () => {
            const res = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_API_URL}/subjects`,
              {
                credentials: "include",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              },
              { retries: 2, retryDelayMs: 600 },
            );

            if (!res.ok) {
              throw new Error("فشل في تحميل المواد");
            }

            return res.json();
          },
          120_000,
        );

        if (isMounted) {
          const initialData = data.map((sub, index) => ({
            ...sub,
            chaptersCount: sub.chaptersCount ?? 0,
            color: UI_COLORS[index % UI_COLORS.length],
          }));
          setSubjects(initialData);
        }
      } catch (err) {
        console.error("فشل في تحميل المواد", err);
        if (isMounted) {
          setError(
            "حدث خطأ أثناء تحميل المواد الدراسية. يرجى المحاولة مرة أخرى.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSubjects();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SubjectsContext.Provider value={{ subjects, isLoading, error }}>
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (context === undefined) {
    throw new Error("useSubjects must be used within a SubjectsProvider");
  }
  return context;
}
