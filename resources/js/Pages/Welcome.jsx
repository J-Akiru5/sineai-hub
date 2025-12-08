import { Link, Head } from '@inertiajs/react';

export default function Welcome(props) {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen relative overflow-hidden bg-slate-950">

                {/* Background cover image */}
                <img src="/images/bg-library.jpg" alt="Library background" className="absolute inset-0 w-full h-full object-cover z-0" />

                {/* Cinematic overlay to darken and add atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30 z-0" aria-hidden="true" />

                {/* Top navbar (transparent) */}
                <nav className="absolute top-0 left-0 w-full z-40 px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <img src="/images/logo.png" alt="Guild Logo" className="w-12 h-auto" />
                            <span className="text-sm text-amber-200/80 font-semibold tracking-wider hidden sm:inline">SineAI Guild</span>
                        </Link>
                    </div>

                    <div className="hidden sm:flex items-center gap-6 text-sm text-amber-100/70">
                        <a href="#story" className="hover:text-amber-200">Story</a>
                        <a href="#features" className="hover:text-amber-200">Features</a>
                        <a href="#media" className="hover:text-amber-200">Media</a>
                        <a href="#community" className="hover:text-amber-200">Community</a>
                    </div>
                </nav>

                {/* Hero (centered) */}
                <header className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
                    <div className="max-w-6xl">
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-widest leading-tight bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-2xl">
                            DIRECT YOUR VISION
                            <br />
                            WITH AI PRECISION
                        </h1>

                        <p className="mt-4 text-amber-500/80 tracking-[0.5em] text-sm md:text-base uppercase font-bold">
                            THE GUILD OF CREATIVE MACHINES
                        </p>
                    </div>
                </header>

                {/* Spark character - two placements for responsive behavior */}
                {/* Desktop / larger screens: bottom-right */}
                <img src="/images/spark.gif" alt="Spark character" className="hidden md:block absolute bottom-12 right-16 z-25 h-[40vh] w-auto pointer-events-none animate-[bounce_6s_infinite]" />

                {/* Mobile: bottom-center (overlaps glass UI slightly) */}
                <img src="/images/spark.gif" alt="Spark character" className="md:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 z-25 h-[30vh] w-auto pointer-events-none animate-[bounce_6s_infinite]" />

                {/* Bottom glass interface: desktop absolute corners, mobile stacked centered */}

                {/* Desktop: only left glass card (no right card near Spark) */}
                <div className="hidden md:block">
                    <div className="absolute bottom-12 left-8 z-30">
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-lg max-w-sm">
                            <h3 className="text-amber-100 font-semibold text-lg">Join the Guild</h3>
                            <p className="mt-2 text-amber-200/80 text-sm">Collaborate with creatives and access premium models.</p>
                            <div className="mt-4">
                                <Link href={route('register')} className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-bold shadow-lg">Join the Guild</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile stacked cards centered */}
                <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-4 px-4 w-full max-w-sm">
                    <div className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 p-5 rounded-lg">
                        <h3 className="text-amber-100 font-semibold">Join the Guild</h3>
                        <p className="mt-1 text-amber-200/80 text-sm">Access premium models & community.</p>
                        <div className="mt-3">
                            <Link href={route('register')} className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-bold">Join</Link>
                        </div>
                    </div>
                </div>

                {/* Small footer meta (kept subtle) */}
                <footer className="absolute left-6 right-6 bottom-2 z-20 text-center text-xs text-slate-400/60">
                    © {new Date().getFullYear()} SineAI Hub — Crafted with cinematic intent.
                </footer>
            </div>
        </>
    );
}
