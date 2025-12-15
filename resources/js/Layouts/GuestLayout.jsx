import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSelector } from '@/Components/LanguageSelector';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Guest({ children }) {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <div className={`min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Theme & Language Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <ThemeToggle />
                <LanguageSelector />
            </div>

            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-20">
                {isDark ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                        {/* Animated gradient orbs - Dark */}
                        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px] animate-pulse delay-1000" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
                        {/* Animated gradient orbs - Light */}
                        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-300/30 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-[120px] animate-pulse delay-1000" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[150px]" />
                    </>
                )}
            </div>

            {/* Subtle grid pattern overlay */}
            <div 
                className={`absolute inset-0 -z-10 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Floating particles effect */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full animate-float ${isDark ? 'bg-amber-400/30' : 'bg-amber-500/40'}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            {/* Logo section with glow effect */}
            <div className="mb-8 relative">
                <Link href="/" className="flex flex-col items-center gap-3 group">
                    {/* Glow behind logo */}
                    <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <img
                        src="/images/logo.png"
                        alt="SineAI Hub"
                        className="w-24 h-24 object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] group-hover:scale-110 group-hover:drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-all duration-300 relative z-10"
                    />

                    <span className={`text-2xl font-bold tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        SineAI <span className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">Hub</span>
                    </span>
                </Link>
            </div>

            {/* Form card with enhanced styling */}
            <div className={`w-full sm:max-w-md px-8 py-10 backdrop-blur-2xl border rounded-3xl relative z-10 transition-all duration-300 ${
                isDark 
                    ? 'bg-slate-900/70 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:border-amber-500/20' 
                    : 'bg-white/80 border-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:border-amber-500/30'
            }`}>
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <p className={`mt-8 text-sm relative z-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                &copy; {new Date().getFullYear()} SineAI Hub. {t('common.all_rights_reserved')}
            </p>

            {/* CSS for float animation */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(20px);
                        opacity: 0;
                    }
                }
                .animate-float {
                    animation: float linear infinite;
                }
            `}</style>
        </div>
    );
}
