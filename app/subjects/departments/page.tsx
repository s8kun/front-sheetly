"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Code2,
  Cpu,
  Database,
  Network,
  Sparkles,
  ChevronDown,
  Layers,
  GraduationCap,
} from "lucide-react";

// List of departments with their specific colors and real data
const DEPARTMENTS = [
  {
    id: "se",
    name: "هندسة البرمجيات (SE)",
    icon: Code2,
    colorClass: "text-blue-600",
    bgLight: "bg-blue-50",
    borderLight: "border-blue-100",
    description:
      "الشخص هذا اسمه مهندس برمجيات. حنتكلم عليه باختصار، هذا مهامه الأساسية: التحسين من جودة المنتج (البرنامج)، الوقت عنده مهم جداً، يهتم بالتفاصيل زي سهولة الاستخدام وأداء المنتج بشكل لا يوصف، يهتم بالديزاين وشكل المنتج وتناسق الألوان.",
    points: [
      "اسمه مهندس لأنه يهتم بهندسة المنتج عشان يطلع في أحسن صورة للزبون من حيث جودة الأداء والسرعة وتسليمه في الوقت المحدد.",
      "مواد التخصص تعتمد على الفهم وليس الحفظ، حتلقاها جميلة جداً وبسيطة.",
      "مهندس البرمجيات يمكن أن يأخذ دور المبرمج، ولكن المبرمج لا يمكنه أخذ دور مهندس البرمجيات (لأن المهندس يدرس منهجيات وطرق لإنتاج المنتج).",
      "قاعدة التخصص: Always search دائماً ابحث.",
    ],
  },
  {
    id: "cs",
    name: "علوم الحاسوب (CS)",
    icon: Cpu,
    colorClass: "text-emerald-600",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-100",
    description:
      "هذا القسم بحر يتفرع منه عدة مجالات (الذكاء الاصطناعي، تطوير الويب، تصميم التطبيقات...). في الكلية يعطوك مفاهيم بسيطة ورؤوس أقلام كتمهيد للطريق، وأنت تغوص في المجال اللي تبيه كمهارة وتطور نفسك فيه لمرحلة الاحتراف.",
    points: [
      "نصيحة: امسك مجال واحد بس (مثلاً برمجة التطبيقات) عشان ماتلخبطش روحك وماديرش روحك سوبروتاخذ مجالين.",
      "التطوير الذاتي حيسهل عليك مواد الكلية ويخليها تافهة بالنسبة لك، وحيفيدك جداً في مشروع التخرج.",
      "أهم شيء: امشِ على خطة القسم أياً كان، الخطة موضوعة عشان توفق بين المواد.",
      "مادة Numerical تتطلب حفظ للقوانين وتطبيقها مباشرة.",
    ],
  },
  {
    id: "ai",
    name: "الذكاء الاصطناعي (AI)",
    icon: Sparkles,
    colorClass: "text-purple-600",
    bgLight: "bg-purple-50",
    borderLight: "border-purple-100",
    description:
      "التخصص هذا يعتبر من أحدث وأقوى التخصصات، الذكاء الاصطناعي ببساطة هو إنك تبني أنظمة تقدر تتعلم من البيانات وتاخذ قرارات أو تعطي توقعات بدون ما تكتب لها كل خطوة بالتفصيل.",
    points: [
      "كلمة 'بيانات' حتتكرر في كل مادة تقريباً (صور، نصوص، أرقام). وظيفتك التعلم كيف تستخرج منها نتيجة.",
      "أهم مادة هي Machine Learning وفيها تتعلم خوارزميات تصنيف وتوقع، تعتمد على الفهم والرياضيات (إحصاء وجبر).",
      "البرمجة أساسية جداً وأكثر لغة مستخدمة هي Python.",
      "تعتمد على العقل التحليلي، البرمجة القوية، والصبر. اختار مجال دقيق زي (رؤية حاسوبية أو معالجة لغات) ولا تتشتت.",
    ],
  },
  {
    id: "is",
    name: "نظم المعلومات (IS)",
    icon: Database,
    colorClass: "text-amber-600",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-100",
    description:
      "الشخص هنا تقدر تسميه محلل ومدير مهام. هو الأغلب المسؤول الأول في التفاهم مع الزبون وتوثيق متطلباته (SRS). لازم يكون عنده لباقة وأسلوب تعامل إداري متين.",
    points: [
      "يعتبر من أهم التخصصات وأكثرها حساسية لأنه الواجهة الأساسية لأي فريق تقني.",
      "في الدول المتقدمة التخصص مهم جداً وصعب تاخذه فقط من كورسات، لازم تستفيد من الأساتذة والفهم العميق.",
      "مواد التخصص ممتازة لو اتجهت للفهم مش الحفظ.",
      "مادة (is201) حتفهمك التخصص أكثر. يناسب من يحب الإدارة، تنظيم الوقت والتعامل مع الناس.",
    ],
  },
  {
    id: "cn",
    name: "الشبكات والاتصالات (CN)",
    icon: Network,
    colorClass: "text-rose-600",
    bgLight: "bg-rose-50",
    borderLight: "border-rose-100",
    description:
      "التخصص تركيزه كله على الشبكات والبروتوكولات، حتشربها شرب! فيه مجالات واجد زي أمن السيبراني، وحتى تصميم المواقع. ولازم تتعلم برمجة (بايثون طاغية الطاغية حالياً).",
    points: [
      "التخصص مش مستحيل بس متهزش عليه، محتاج فهم عميق وتركيز بدءاً من (IT271).",
      "ستدرس مادة الإنترنت تتضمن HTML, CSS، وجزء خفيف من JS.",
      "تذكر أن التخصص مجالات عمله مطلوبة جداً في ليبيا (شركات اتصالات وغيرها).",
      "فرص العمل ممتازة طالما الكفاءة موجودة.",
    ],
  },
];

export default function DepartmentsPage() {
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const toggleDept = (id: string) => {
    setExpandedDept(expandedDept === id ? null : id);
  };

  return (
    <div>
      <main>
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 bg-[#eaf2ff] text-primary border border-[#c9dcff] px-3 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4">
            <GraduationCap className="w-4 h-4" />
            نبذة عن الأقسام
          </span>
          <h1 className="text-3xl font-black text-foreground mb-3">
            دليلك لأقسام الكلية
          </h1>
          <p className="text-muted text-sm max-w-xl mx-auto">
            تعرف على تفاصيل كل قسم، مجالاته، والنصائح المهمة قبل التخصص. نتمنى
            لك رحلة جامعية موفقة!
          </p>
        </m.div>

        {/* Departments List container matching subjects page style */}
        <div className="grid gap-4 mb-8">
          {DEPARTMENTS.map((dept) => {
            const isExpanded = expandedDept === dept.id;

            return (
              <m.div
                key={dept.id}
                layout
                className={`group flex flex-col bg-white p-1 rounded-lg border transition-colors ${
                  isExpanded
                    ? "border-primary"
                    : "border-border hover:border-[#b8cff3]"
                }`}
              >
                {/* Header Row (Always visible) */}
                <button
                  onClick={() => toggleDept(dept.id)}
                  className="w-full text-right p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${dept.bgLight} ${dept.colorClass} border ${dept.borderLight} shrink-0`}
                    >
                      <dept.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black transition-colors ${isExpanded ? "text-primary" : "text-foreground group-hover:text-primary"}`}
                      >
                        {dept.name}
                      </h3>
                      <span className="text-[10px] text-muted font-bold bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        الكلية
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-500">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded Content using AnimatePresence */}
                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-2 border-t border-border mt-1 border-dashed">
                        {/* Description */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm md:text-base text-slate-600 leading-relaxed border border-slate-100">
                          {dept.description}
                        </div>

                        {/* Points */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            نقاط هامة:
                          </h4>
                          {dept.points.map((point, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full ${dept.bgLight} flex items-center justify-center shrink-0 mt-0.5`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${dept.colorClass.replace("text-", "bg-")}`}
                                />
                              </div>
                              <span className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
                                {point}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
