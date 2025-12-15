import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-950 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px]" />
            </div>

            {/* Subtle grid pattern overlay */}
            <div 
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Floating particles effect */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float"
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

                    <span className="text-2xl font-bold tracking-tight text-white relative z-10">
                        SineAI <span className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">Hub</span>
                    </span>
                </Link>
            </div>

            {/* Form card with enhanced styling */}
            <div className="w-full sm:max-w-md px-8 py-10 bg-slate-900/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl relative z-10 hover:border-amber-500/20 transition-colors duration-500">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-sm text-slate-500 relative z-10">
                &copy; {new Date().getFullYear()} SineAI Hub. All rights reserved.
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
