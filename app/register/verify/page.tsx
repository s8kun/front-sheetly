'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cairo } from 'next/font/google';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, ShieldCheck } from 'lucide-react';

const cairo = Cairo({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export default function VerifyOTP() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleResendOTP = async () => {
        if (!email || isResending) return;
        setIsResending(true);
        setError('');
        setMessage('');

        const url = `${process.env.NEXT_PUBLIC_API_URL}/resend-otp`;
        console.log("Calling Resend OTP URL:", url);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('تم إعادة إرسال رمز التحقق لبريدك الإلكتروني.');
            } else {
                if (res.status === 429) {
                    setError('محاولات كثيرة جداً. يرجى الانتظار دقيقة قبل طلب رمز جديد.');
                } else {
                    setError(data.message || 'فشل إعادة إرسال الرمز. يرجى المحاولة لاحقاً.');
                }
            }
        } catch (err) {
            setError('خطأ في الاتصال بالسيرفر.');
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (!email) {
            setError('البريد الإلكتروني مفقود. يرجى محاولة التسجيل مرة أخرى.');
        } else if (searchParams.get('resend') === 'true') {
            handleResendOTP();
        }
    }, [email, searchParams]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        setError('');

        // Move to next input if value is entered
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const code = otp.join('');
        if (code.length < 4) {
            setError('يرجى إدخال رمز التحقق كاملاً (4 أرقام).');
            return;
        }

        setIsLoading(true);
        console.log("Verifying OTP for:", email, "Code:", code);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: code, // إرسال كنص للحفاظ على الأصفار
                }),
            });

            const data = await res.json();
            console.log("Verify Response:", data);

            if (res.ok) {
                setMessage('تم تأكيد الحساب بنجاح! سيتم توجيهك لصفحة الدخول.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                if (res.status === 429) {
                    setError('لقد تجاوزت عدد المحاولات المسموح بها. يرجى الانتظار قليلاً.');
                } else {
                    setError(data.message || 'الرمز غير صحيح أو منتهي الصلاحية.');
                }
            }
        } catch (err) {
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
            <div
                className="hidden md:block absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70"/>
            <div
                className="hidden md:block absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70 delay-700"/>

            <nav className="absolute top-6 right-6 z-50">
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
                                <ShieldCheck className="w-3.5 h-3.5 ml-1.5" />
                                تأكيد الحساب
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            <div
                className="w-full h-screen md:h-auto md:max-w-md bg-white/80 backdrop-blur-xl md:rounded-3xl md:shadow-2xl md:border md:border-white/50 flex flex-col px-6 pt-24 pb-10 md:py-10 md:px-10 relative z-10">
                <div className="w-full mx-auto flex flex-col justify-center h-full md:h-auto">
                    <div className="text-center mb-10">
                        <div
                            className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 mb-6">
                            ش
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">تأكيد الحساب</h2>
                        <p className="text-slate-500 text-sm mt-3 font-medium">
                            أدخل رمز التحقق المرسل إلى: <br/>
                            <span className="text-indigo-600 font-bold" dir="ltr">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div
                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div
                            className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-medium text-center">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-center gap-4" dir="ltr">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={isLoading}
                                    className="w-14 h-16 text-center text-3xl font-bold rounded-2xl border border-slate-300 bg-white/60 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
                        >
                            {isLoading ? "جاري التحقق..." : "تأكيد الرمز"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            لم يصلك الرمز؟ <button 
                                onClick={handleResendOTP}
                                disabled={isResending}
                                className="font-bold text-indigo-600 hover:underline disabled:opacity-50"
                            >
                                {isResending ? 'جاري الإرسال...' : 'إعادة الإرسال'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
