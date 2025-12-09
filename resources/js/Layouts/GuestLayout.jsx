import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-950 relative overflow-hidden">
            {/* Background library image with dark overlay */}
            <div className="absolute inset-0 -z-10">
                <img src="/images/bg-library.jpg" alt="Library background" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-slate-950/80" />
            </div>

            <div className="mb-6">
                <Link href="/" className="flex flex-col items-center gap-2">
                    {/* Option 1: Use your uploaded Image (Best Quality) */}
                    <img
                        src="/images/logo.png"
                        alt="SineAI Hub"
                        className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:scale-105 transition-transform"
                    />

                    {/* Text Label (Optional - adds a nice touch below the logo) */}
                    <span className="text-2xl font-bold tracking-tight text-white">
                        SineAI <span className="text-amber-500">Hub</span>
                    </span>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl relative z-10">
                {children}
            </div>
        </div>
    );
}
