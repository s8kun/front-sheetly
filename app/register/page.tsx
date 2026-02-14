'use client';

import React, {useState} from 'react';
import {Cairo} from 'next/font/google';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import { Home, UserPlus } from 'lucide-react';

const cairo = Cairo({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export default function Register() {
    const router = useRouter();

    // States
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setError(''); // إخفاء الخطأ عند الكتابة
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // تحقق بسيط قبل الإرسال
        if (formData.password !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة.');
            return;
        }

        setIsLoading(true);

        // تجهيز البيانات للباك-إند
        const payload = {
            name: formData.name,
            email: `itstd.${formData.studentId}@uob.edu.ly`,
            password: formData.password,
            password_confirmation: formData.confirmPassword
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();


// ... (inside handleSubmit after res.ok)
            if (res.ok) {
                // نجاح المرحلة الأولى من التسجيل
                // التوجيه لصفحة التحقق مع تمرير البريد الإلكتروني
                router.push(`/register/verify?email=${encodeURIComponent(payload.email)}`);
            } else {
                // معالجة الأخطاء (422 Unprocessable Entity وغيرها)
                if (data.errors) {
                    // جلب أول رسالة خطأ
                    const firstError = Object.values(data.errors)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : 'بيانات غير صالحة');
                } else {
                    setError(data.message || 'حدث خطأ أثناء إنشاء الحساب.');
                }
            }
        } catch (err) {
            console.error("Register Error:", err);
            setError('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen w-full flex md:items-center md:justify-center bg-slate-50 relative overflow-hidden ${cairo.className}`}
            dir="rtl"
        >
            {/* الخلفية الجمالية */}
            <div
                className="hidden md:block absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70"/>
            <div
                className="hidden md:block absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-fuchsia-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70 delay-1000"/>

            <nav className="absolute top-6 right-6 z-50" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                    <li className="inline-flex items-center">
                        <Link href="/"
                              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            <Home className="w-3.5 h-3.5 ml-1.5" />
                            الرئيسية
                        </Link>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <span className="mx-1 text-slate-400">/</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-600">
                                <UserPlus className="w-3.5 h-3.5 ml-1.5" />
                                جديد
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* البطاقة الرئيسية */}
            <div
                className="w-full h-screen md:h-auto md:max-w-lg bg-white/80 backdrop-blur-xl md:rounded-3xl md:shadow-2xl md:border md:border-white/50 flex flex-col px-6 pt-24 pb-10 md:py-10 md:px-10 relative z-10">

                <div className="w-full mx-auto flex flex-col justify-center h-full md:h-auto">
                    <div className="text-center mb-8">
                        <div
                            className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 mb-4">
                            ش
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                            حساب جديد
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 font-medium">
                            سجل بياناتك للبدء في استخدام النظام
                        </p>
                    </div>

                    {/* عرض رسالة الخطأ */}
                    {error && (
                        <div
                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="الاسم الثلاثي"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`block w-full h-14 rounded-2xl border ${error && !formData.name ? 'border-red-300' : 'border-slate-300'} bg-white/60 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base transition-all px-4`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">رقم القيد</label>
                            <div
                                className={`flex items-center w-full h-14 rounded-2xl border ${error && !formData.studentId ? 'border-red-300' : 'border-slate-300'} bg-white/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden shadow-sm transition-all`}
                                dir="ltr">
                                <span
                                    className="shrink-0 pl-3 pr-1 text-slate-500 font-mono text-xs md:text-sm border-r border-slate-200 select-none h-full flex items-center bg-slate-50/50">itstd.</span>
                                <input
                                    type="text"
                                    name="studentId"
                                    inputMode="numeric"
                                    placeholder="0000"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="flex-1 h-full border-0 bg-transparent text-center text-slate-900 placeholder:text-slate-300 focus:ring-0 text-lg font-mono tracking-widest outline-none min-w-[60px]"
                                />
                                <span
                                    className="shrink-0 pr-3 pl-1 text-slate-500 font-mono text-[10px] sm:text-xs md:text-sm border-l border-slate-200 select-none h-full flex items-center bg-slate-50/50">@uob.edu.ly</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
                                <input
                                    type="password"
                                    name="password"
                                    dir="ltr"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`block w-full h-14 rounded-2xl border ${error && !formData.password ? 'border-red-300' : 'border-slate-300'} bg-white/60 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">تأكيد الرمز</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    dir="ltr"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`block w-full h-14 rounded-2xl border ${error && !formData.confirmPassword ? 'border-red-300' : 'border-slate-300'} bg-white/60 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4`}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin ml-2 h-5 w-5 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    "إنشاء حساب"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            لديك حساب بالفعل؟ <Link href="/login" className="font-bold text-indigo-600 hover:underline">سجل
                            دخولك</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}