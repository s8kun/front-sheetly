type RetryOptions = {
  retries?: number;
  retryDelayMs?: number;
  retryStatuses?: number[];
};

const memoryCache = new Map<string, { expiresAt: number; data: unknown }>();

const DEFAULT_RETRY_STATUSES = [408, 425, 429, 500, 502, 503, 504];

/**
 * دالة مساعدة للنوم (تأخير التنفيذ) لمدة محددة بالملي ثانية.
 * @param {number} ms - المدة بالملي ثانية.
 * @returns {Promise<void>} 
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * دالة تغليف متقدمة للـ `fetch` العادي.
 * 
 * تقوم بإعادة إرسال الطلب تلقائياً في حال فشله بسبب مشاكل معينة في الخادم
 * (مثل 500, 502, 504, 429) باستخدام استراتيجية التأخير المتزايد (exponential backoff).
 *
 * @param {RequestInfo | URL} input - الرابط أو كائن Request المراد الاتصال به.
 * @param {RequestInit} [init] - إعدادات fetch القياسية (الطريقة، الهيدرز، البودي، الخ..).
 * @param {RetryOptions} [options] - إعدادات إعادة المحاولة (عدد المحاولات، التأخير، والحالات المسموح בהا).
 * @returns {Promise<Response>} كائن Response القياسي.
 * @throws {Error} ترمي خطأ في الشبكة إذا فشلت جميع المحاولات.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {},
) {
  const {
    retries = 2,
    retryDelayMs = 500,
    retryStatuses = DEFAULT_RETRY_STATUSES,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(input, init);

      if (!res.ok && retryStatuses.includes(res.status) && attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      return res;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Network request failed");
}

/**
 * دالة مساعدة لتخزين نتيجة أي عملية جلب بيانات مؤقتاً في الذاكرة (Caching).
 * 
 * بمجرد نجاح جلب البيانات يتم حفظها في الذاكرة لمدة محددة (TTL).
 * إذا تم طلب نفس البيانات (باستخدام نفس مفتاح cacheKey) قبل انتهاء الوقت،
 * ترجع الدالة البيانات المخزنة فوراً بدون الحاجة للاتصال بالخادم مرة أخرى.
 *
 * @param {string} cacheKey - معرف فريد للبيانات (مثال: `subject:list:searchQuery`).
 * @param {() => Promise<T>} fetcher - دالة غير متزامنة (async) تقوم بجلب البيانات فعلياً.
 * @param {number} [ttlMs=60000] - مدة الاحتفاظ بالبيانات في الذاكرة بالملي ثانية (الافتراضي: 60 ثانية).
 * @returns {Promise<T>} البيانات المعادة سواء من الخادم أو من الذاكرة المؤقتة.
 */
export async function fetchJsonWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs = 60_000,
): Promise<T> {
  const now = Date.now();
  const memoryEntry = memoryCache.get(cacheKey);

  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.data as T;
  }

  const data = await fetcher();
  const expiresAt = now + ttlMs;

  memoryCache.set(cacheKey, { expiresAt, data });

  return data;
}

/**
 * دالة تقوم بمسح أو إلغاء تخزين بيانات معينة من الذاكرة المؤقتة.
 * 
 * مفيدة جداً عند إضافة أو حذف بيانات في الخادم، حيث نستخدمها لحذف الكاش القديم
 * لكي يجبر التطبيق على جلب البيانات المحدثة (مثال: مسح كل كاش `subject:list:*`).
 *
 * @param {string[]} prefixes - مصفوفة تحتوي على بدايات المفاتيح المراد مسحها.
 */
export function invalidateCacheByPrefix(prefixes: string[]) {
  if (!prefixes.length) return;

  for (const key of Array.from(memoryCache.keys())) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      memoryCache.delete(key);
    }
  }
}
