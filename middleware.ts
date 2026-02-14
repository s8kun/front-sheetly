import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // المسارات التي تتطلب تسجيل دخول
    const isProtectedPath = pathname.startsWith('/subjects') || pathname.startsWith('/admin');

    if (isProtectedPath && !token) {
        // إذا كان يحاول الوصول لمسار محمي وهو ليس مسجلاً، نوجهه لصفحة الدخول
        const url = new URL('/login', request.url);
        // إضافة المسار الذي كان يحاول الوصول إليه للرجوع له بعد تسجيل الدخول (اختياري)
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // حماية إضافية للوحة التحكم (فقط للأدمن - يتطلب فحص التوكن أو دور المستخدم)
    // ملاحظة: الفحص العميق لدور المستخدم يفضل أن يكون في الـ API، 
    // هنا يمكننا فقط التأكد من وجود توكن للمسارات الإدارية.
    if (pathname.startsWith('/admin') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// تحديد المسارات التي يعمل عليها الـ Middleware بدقة
export const config = {
    matcher: [
        '/subjects/:path*',
        '/admin/:path*',
    ],
};
