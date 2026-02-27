"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calculator, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface SubjectEntry {
  id: string;
  name: string;
  units: number | "";
  grade: number | "";
}

const GRADES = [
  { label: "A (4.0)", value: 4.0 },
  { label: "B-plus (3.5)", value: 3.5 },
  { label: "B (3.0)", value: 3.0 },
  { label: "C-plus (2.5)", value: 2.5 },
  { label: "C (2.0)", value: 2.0 },
  { label: "D-plus (1.5)", value: 1.5 },
  { label: "D (1.0)", value: 1.0 },
  { label: "F (0.0)", value: 0.0 },
];

export default function GPACalculatorPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: "1", name: "", units: "", grade: "" },
    { id: "2", name: "", units: "", grade: "" },
    { id: "3", name: "", units: "", grade: "" },
  ]);

  const [previousUnits, setPreviousUnits] = useState<number | "">("");
  const [previousGPA, setPreviousGPA] = useState<number | "">("");

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { id: Date.now().toString(), name: "", units: "", grade: "" },
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((sub) => sub.id !== id));
    } else {
      showToast("لا يمكن حذف جميع المواد", "error");
    }
  };

  const updateSubject = (id: string, field: keyof SubjectEntry, value: any) => {
    setSubjects(
      subjects.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)),
    );
  };

  const resetCalculator = () => {
    if (confirm("هل أنت متأكد من تصفير الحاسبة؟")) {
      setSubjects([
        { id: Date.now().toString(), name: "", units: "", grade: "" },
        { id: (Date.now() + 1).toString(), name: "", units: "", grade: "" },
        { id: (Date.now() + 2).toString(), name: "", units: "", grade: "" },
      ]);
      setPreviousUnits("");
      setPreviousGPA("");
      showToast("تم تصفير الحاسبة", "success");
    }
  };

  // Calculation Logic (Formula: Σ(Units * Grade) / Total Units)
  const calculateGPA = () => {
    let currentTotalPoints = 0;
    let currentTotalUnits = 0;

    subjects.forEach((sub) => {
      const units = Number(sub.units);
      const grade = Number(sub.grade);

      if (
        !isNaN(units) &&
        sub.units !== "" &&
        !isNaN(grade) &&
        sub.grade !== ""
      ) {
        currentTotalUnits += units;
        currentTotalPoints += units * grade;
      }
    });

    const prevUnitsNum = Number(previousUnits) || 0;
    const prevGPANum = Number(previousGPA) || 0;
    const prevTotalPoints = prevUnitsNum * prevGPANum;

    const overallTotalPoints = currentTotalPoints + prevTotalPoints;
    const overallTotalUnits = currentTotalUnits + prevUnitsNum;

    const semesterGPA =
      currentTotalUnits > 0 ? currentTotalPoints / currentTotalUnits : 0;
    const cumulativeGPA =
      overallTotalUnits > 0 ? overallTotalPoints / overallTotalUnits : 0;

    return {
      semester: semesterGPA.toFixed(2),
      cumulative: cumulativeGPA.toFixed(2),
      totalUnits: overallTotalUnits,
    };
  };

  const results = calculateGPA();
  const hasValidInputs =
    subjects.some((sub) => sub.units !== "" && sub.grade !== "") ||
    (previousUnits !== "" && previousGPA !== "");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground mb-3 flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          حاسبة المعدل الجامعي
        </h1>
        <p className="text-muted">
          احسب معدلك الفصلي والتراكمي بسهولة. لا تنسى الوحدات حتى لو المادة بـ
          F!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Previous Semester Card */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-lg font-black text-foreground mb-4">
              المعدل التراكمي السابق (اختياري)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  إجمالي الوحدات المنجزة
                </label>
                <input
                  type="number"
                  placeholder="مثال: 45"
                  className="field w-full"
                  value={previousUnits}
                  onChange={(e) =>
                    setPreviousUnits(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  المعدل التراكمي السابق
                </label>
                <input
                  type="number"
                  placeholder="مثال: 3.25"
                  className="field w-full"
                  value={previousGPA}
                  onChange={(e) =>
                    setPreviousGPA(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  step="0.01"
                  min="0"
                  max="4"
                />
              </div>
            </div>
          </div>

          {/* Current Semester Subjects */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-foreground">
                مواد الفصل الحالي
              </h2>
              <button
                onClick={resetCalculator}
                className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                تصفير
              </button>
            </div>

            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-3 px-2 text-sm font-bold text-muted mb-2">
                <div className="col-span-5">اسم المادة (اختياري)</div>
                <div className="col-span-3">الوحدات</div>
                <div className="col-span-3">التقدير (التصفاية)</div>
                <div className="col-span-1"></div>
              </div>

              <AnimatePresence>
                {subjects.map((subject, index) => (
                  <m.div
                    key={subject.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50 p-3 sm:p-2 rounded-xl sm:bg-transparent border sm:border-transparent border-slate-200"
                  >
                    <div className="col-span-1 sm:col-span-5">
                      <label className="sm:hidden text-xs font-bold text-muted mb-1 block">
                        المادة
                      </label>
                      <input
                        type="text"
                        placeholder={`المادة ${index + 1}`}
                        className="field w-full"
                        value={subject.name}
                        onChange={(e) =>
                          updateSubject(subject.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-3">
                      <label className="sm:hidden text-xs font-bold text-muted mb-1 block">
                        الوحدات
                      </label>
                      <input
                        type="number"
                        placeholder="الوحدات"
                        className="field w-full"
                        value={subject.units}
                        onChange={(e) =>
                          updateSubject(
                            subject.id,
                            "units",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-3">
                      <label className="sm:hidden text-xs font-bold text-muted mb-1 block">
                        التقدير
                      </label>
                      <select
                        className="select w-full"
                        value={subject.grade}
                        onChange={(e) =>
                          updateSubject(
                            subject.id,
                            "grade",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      >
                        <option value="">التقدير</option>
                        {GRADES.map((g) => (
                          <option key={g.label} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-end sm:justify-center mt-2 sm:mt-0">
                      <button
                        onClick={() => removeSubject(subject.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف المادة"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={addSubject}
              className="mt-4 w-full py-3 border-2 border-dashed border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة مادة أخرى
            </button>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-lg sticky top-8">
            <h2 className="text-xl font-black mb-6 text-center">النتيجة</h2>

            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-primary-100 text-sm font-bold mb-1">
                  المعدل الفصلي
                </p>
                <div className="text-4xl font-black">
                  {results.semester === "NaN" ? "0.00" : results.semester}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center text-primary shadow-inner">
                <p className="text-slate-500 text-sm font-bold mb-1">
                  المعدل التراكمي المنوقع
                </p>
                <div className="text-4xl font-black">
                  {results.cumulative === "NaN" ? "0.00" : results.cumulative}
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex justify-between items-center text-sm">
                <span className="text-primary-100">إجمالي الوحدات</span>
                <span className="font-bold text-lg">
                  {results.totalUnits || "0"}
                </span>
              </div>
            </div>

            {!hasValidInputs && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center text-xs text-primary-200 bg-black/10 p-3 rounded-lg"
              >
                أدخل الوحدات والتقدير للمواد لظهور النتيجة
              </m.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
