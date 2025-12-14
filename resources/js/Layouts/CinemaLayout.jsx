import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import SearchBar from '@/Components/SearchBar';

export default function CinemaLayout({ children, header }) {
    const [scrolled, setScrolled] = useState(false);
    const { auth } = usePage().props;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-slate-950 to-black">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-gradient-to-b from-black/80 via-black/60 to-transparent'}`}>
                <div className="px-6 lg:px-10">
                    <div className="h-16 grid grid-cols-3 items-center">
                        <div className="flex items-center gap-3">
                            <Link href={route('premiere.index')} className="flex items-center gap-3">
                                <img src="/images/logo.png" alt="SineAI Logo" className="h-10 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]" />
                                <span className="font-bold text-lg text-amber-300">SineAI Hub</span>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center">
                            <Link href={route('premiere.index')} className="tracking-widest text-amber-500 font-black text-sm sm:text-base hover:text-amber-400">
                                PREMIERE
                            </Link>
                        </div>

                        <div className="flex items-center justify-end gap-6">
                            <div className="w-72 md:w-96">
                                <SearchBar />
                            </div>
                            <Link href={route('home')} className="hover:text-amber-300">Home</Link>
                            {auth?.user ? (
                                <Link href={route('projects.my')} className="hover:text-amber-300">My Studio</Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hover:text-amber-300">Log in</Link>
                                    <Link href={route('register')} className="hover:text-amber-300">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-16"> {/* push content below nav */}
                {header && <header className="mb-6">{header}</header>}
                <main>{children}</main>
            </div>
        </div>
    );
}
