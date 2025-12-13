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
        <div className="bg-gradient-to-b from-[#4b0f0f] via-[#2b0505] to-black text-white min-h-screen">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors ${scrolled ? 'bg-black/80 border-b border-white/6' : 'bg-black/10'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link href={route('premiere.index')} className="flex items-center gap-3">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400">
                                <rect x="2" y="4" width="20" height="14" rx="2" fill="currentColor" />
                                <polygon points="10,8 16,11 10,14" fill="#2b0505" />
                            </svg>
                            <span className="font-bold text-lg text-amber-400">SineAI Hub</span>
                        </Link>

                        <div className="flex items-center gap-6">
                            <div className="w-80 md:w-96">
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
