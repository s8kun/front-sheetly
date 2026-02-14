'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet } from '@/app/types';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { FileText, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [pendingSheets, setPendingSheets] = useState<Sheet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    
    // حالات إضافة مادة جديدة
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', code: '' });
    const [isAddingSubject, setIsAddingSubject] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('user');
            const token = Cookies.get('token');
            
            if (!savedUser || !token) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(savedUser);
            if (user.role?.toLowerCase() !== 'admin') {
                router.push('/subjects');
                return;
            }

            fetchPendingSheets(token);
        };

        checkAuth();
    }, [router]);

    const fetchPendingSheets = async (token: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/sheets/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingSheets(data);
            }
        } catch (error) {
            console.error("Failed to fetch pending sheets", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        setIsAddingSubject(true);

        // تحويل الرمز لحروف كبيرة لضمان التوحيد
        const subjectData = {
            ...newSubject,
            code: newSubject.code.trim().toUpperCase()
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subjects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(subjectData)
            });

            if (res.ok) {
                setNewSubject({ name: '', code: '' });
                setShowAddSubject(false);
                router.push('/subjects');
            } else {
                const data = await res.json();
                // تعريب خطأ التكرار (Unique constraint)
                if (data.errors && data.errors.code) {
                    alert('هذه المادة موجودة مسبقاً (رمز المادة مسجل لآخر)');
                } else {
                    alert(data.message || 'خطأ في إضافة المادة');
                }
            }
        } catch (err) {
            alert('فشل الاتصال بالسيرفر');
        } finally {
            setIsAddingSubject(false);
        }
    };

    const handleAction = async (sheetId: number, action: 'approve' | 'reject') => {
        const token = Cookies.get('token');
        if (!token) return;
        
        setActionLoading(sheetId);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/sheets/${sheetId}/${action}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setPendingSheets(prev => prev.filter(s => s.id !== sheetId));
            } else {
                alert('حدث خطأ أثناء تنفيذ الإجراء');
            }
        } catch (error) {
            console.error(`Failed to ${action} sheet`, error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-6 md:p-10">
            <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
                    <p className="text-slate-500">إدارة المواد واعتماد الشيتات</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setShowAddSubject(true)}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                        إضافة مادة جديدة +
                    </button>
                    <Link href="/" className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-center">
                        الرئيسية
                    </Link>
                </div>
            </header>

            {/* Modal إضافة مادة */}
            <AnimatePresence>
                {showAddSubject && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddSubject(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-slate-800 mb-6">إضافة مادة دراسية</h2>
                            <form onSubmit={handleAddSubject} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">اسم المادة</label>
                                    <input 
                                        type="text" required
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="مثال: هندسة برمجيات 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">رمز المادة (Code)</label>
                                    <input 
                                        type="text" required
                                        value={newSubject.code}
                                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                                        placeholder="مثال: SE311"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button" onClick={() => setShowAddSubject(false)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                    <button 
                                        type="submit" disabled={isAddingSubject}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                    >
                                        {isAddingSubject ? 'جاري الحفظ...' : 'حفظ المادة'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <main className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"/>
                    شيتات في انتظار المراجعة
                </h2>
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-3xl" />)}
                    </div>
                ) : pendingSheets.length > 0 ? (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {pendingSheets.map((sheet) => (
                                <motion.div
                                    key={sheet.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{sheet.title}</h3>
                                            <p className="text-sm text-slate-400">بواسطة مستخدم رقم: {sheet.user_id}</p>
                                            <div className="flex gap-2 mt-2 text-right">
                                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                                                    {sheet.type}
                                                </span>
                                                <a href={sheet.file_url} target="_blank" className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold hover:underline">
                                                    عرض الملف
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleAction(sheet.id, 'reject')}
                                            disabled={actionLoading === sheet.id}
                                            className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all disabled:opacity-50"
                                        >
                                            رفض
                                        </button>
                                        <button
                                            onClick={() => handleAction(sheet.id, 'approve')}
                                            disabled={actionLoading === sheet.id}
                                            className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                                        >
                                            {actionLoading === sheet.id ? 'جاري...' : 'اعتماد'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">لا توجد طلبات معلقة حالياً</p>
                    </div>
                )}
            </main>
        </div>
    );
}
