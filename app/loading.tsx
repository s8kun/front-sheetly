export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-xl transition-all duration-500">
            <div className="relative flex flex-col items-center">
                {/* Logo Container */}
                <div className="relative w-20 h-20 flex items-center justify-center mb-8">
                    {/* Pulsing Background */}
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl animate-ping opacity-75"></div>
                    
                    {/* Logo Box */}
                    <div className="relative w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 z-10 animate-pulse">
                        <span className="text-white font-black text-3xl pb-1">ش</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-indigo-600 rounded-full animate-loading-bar"></div>
                </div>
                
                <p className="mt-4 text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase animate-pulse">
                    جاري التحميل
                </p>
            </div>
        </div>
    );
}
