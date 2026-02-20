/**
 * تتحقق مما إذا كان النص يحتوي على أي حروف عربية.
 * 
 * @param {string} text - النص المراد فحصه.
 * @returns {boolean} `true` إذا كان فيه حروف عربية، غير ذلك `false`.
 */
function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * دالة مساعدة لتحويل رسائل الخطأ القادمة من الواجهة الخلفية (Backend) باللغة الإنجليزية
 * إلى رسائل مفهومة وصديقة للمستخدم باللغة العربية (باللهجة الليبية/المحلية).
 *
 * تتضمن الدالة قاموساً داخلياً للكلمات المفتاحية وتقوم بمطابقتها لإرجاع النص المناسب.
 *
 * @param {unknown} error - الخطأ القادم من الخادم (قد يكون رسالة نصية، مصفوفة أخطاء، الخ).
 * @param {string} [fallback] - الرسالة الافتراضية التي تظهر في حال لم يتم التعرف على الخطأ.
 * @returns {string} رسالة الخطأ المترجمة للعربية.
 */
export function toArabicApiError(error: unknown, fallback = "صار خطأ في الخادم، حاول مرة ثانية.") {
  if (Array.isArray(error)) {
    return toArabicApiError(error[0], fallback);
  }

  const message = String(error || "").trim();
  if (!message) return fallback;
  if (hasArabic(message)) return message;

  const normalized = message.toLowerCase();

  const dictionary: Array<[string, string]> = [
    ["too many", "طلبات كثيرة خلال وقت قصير، جرب بعد دقيقة."],
    ["rate limit", "طلبات كثيرة خلال وقت قصير، جرب بعد دقيقة."],
    ["invalid credentials", "بيانات الدخول غير صحيحة."],
    ["unauthorized", "غير مصرح لك بهالإجراء."],
    ["forbidden", "ما عندكش صلاحية لهالإجراء."],
    ["not found", "البيانات المطلوبة مش موجودة."],
    ["email has already been taken", "البريد هذا مسجل من قبل."],
    ["selected email is invalid", "الحساب غير موجود أو البريد غير صحيح."],
    ["can't find a user", "الحساب غير موجود."],
    ["otp", "رمز التحقق غير صحيح أو منتهي."],
    ["code is invalid", "رمز التحقق غير صحيح."],
    ["code is expired", "رمز التحقق منتهي، اطلب رمز جديد."],
    ["token", "الرابط أو الرمز غير صالح."],
    ["expired", "انتهت صلاحية الطلب، جرب من جديد."],
    ["validation", "فيه خطأ في البيانات المدخلة."],
    ["required", "فيه حقول مطلوبة ناقصة."],
    ["server", "الخادم مشغول الآن، حاول بعد شوي."],
    ["network", "فيه مشكلة اتصال، تأكد من النت وحاول مرة ثانية."],
  ];

  for (const [key, arabic] of dictionary) {
    if (normalized.includes(key)) return arabic;
  }

  return fallback;
}
