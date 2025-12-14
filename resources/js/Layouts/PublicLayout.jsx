import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import SparkWidget from '@/Components/SparkWidget';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PublicLayout({ title = 'SineAI Hub', children }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="min-h-screen bg-slate-950 relative overflow-x-hidden text-white">
            <Head title={title} />

            {/* background blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-72 -left-72 w-[30rem] h-[30rem] bg-red-900/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-60 -right-56 w-[28rem] h-[28rem] bg-red-900/20 rounded-full blur-3xl opacity-25" />
            </div>

            <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="inline-flex items-center gap-3 no-underline">
                                <img src="/images/logo.png" alt="SineAI Hub" className="h-10 w-auto rounded-sm" />
                                <div className="hidden sm:block leading-tight">
                                    <div className="text-lg font-semibold tracking-tight text-amber-100">SineAI</div>
                                    <div className="text-sm font-medium tracking-tight text-amber-300">Hub</div>
                                </div>
                            </Link>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            <div className="hidden sm:flex space-x-8">
                                <a href="#about" className="text-sm text-amber-200/90 hover:underline">About</a>
                                <a href="#features" className="text-sm text-amber-200/90 hover:underline">Features</a>
                                <a href="#team" className="text-sm text-amber-200/90 hover:underline">Team</a>
                                <Link href={route('premiere.index')} className="text-sm text-amber-100 font-semibold hover:underline">Premiere</Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm text-amber-200/80 hover:underline">Login</Link>
                            <Link href="/register" className="cta-primary">Register</Link>

                            {/* Mobile hamburger */}
                            <button onClick={() => setOpen((s) => !s)} className="sm:hidden p-2 rounded-md ml-2 text-amber-200 hover:bg-white/5">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!open ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={open ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            {open && (
                <div className="sm:hidden bg-slate-900/95 border-b border-white/6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
                        <a href="#about" className="block text-amber-200">About</a>
                        <a href="#features" className="block text-amber-200">Features</a>
                        <a href="#team" className="block text-amber-200">Team</a>
                        <Link href={route('premiere.index')} className="block text-amber-200">Premiere</Link>
                    </div>
                </div>
            )}

            <main>{children}</main>

            <SparkWidget />

            <footer className="mt-12">
                <div className="bg-slate-950 border-t border-white/10 pt-10 pb-6 text-slate-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                            {/* Column 1 - Brand */}
                            <div className="space-y-4">
                                <ApplicationLogo className="h-10 w-auto text-amber-500" />
                                <p className="text-sm">Empowering Visayan filmmakers with AI-driven creativity.</p>
                            </div>

                            {/* Column 2 - Platform */}
                            <div>
                                <h4 className="text-amber-500 font-bold mb-4">Platform</h4>
                                <ul className="space-y-2">
                                    <li><Link href="/" className="hover:underline hover:text-amber-200 transition-colors">Home</Link></li>
                                    <li><Link href={route('premiere.index')} className="hover:underline hover:text-amber-200 transition-colors">Premiere</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Scriptwriter</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Spark AI</Link></li>
                                </ul>
                            </div>

                            {/* Column 3 - Community */}
                            <div>
                                <h4 className="text-amber-500 font-bold mb-4">Guild</h4>
                                <ul className="space-y-2">
                                    <li><a href="#about" className="hover:underline hover:text-amber-200 transition-colors">About Us</a></li>
                                    <li><a href="#team" className="hover:underline hover:text-amber-200 transition-colors">Leadership</a></li>
                                    <li><Link href={route('register')} className="hover:underline hover:text-amber-200 transition-colors">Join the Guild</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Login</Link></li>
                                </ul>
                            </div>

                            {/* Column 4 - Stay Connected */}
                            <div>
                                <h4 className="text-amber-500 font-bold mb-4">Follow Us</h4>
                                <div className="flex items-center space-x-3 mb-4">
                                    <a href="#" className="text-slate-300 hover:text-white">[FB]</a>
                                    <a href="#" className="text-slate-300 hover:text-white">[IG]</a>
                                    <a href="#" className="text-slate-300 hover:text-white">[YT]</a>
                                </div>

                                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                                    <input type="email" placeholder="Your email" className="flex-1 rounded-md bg-slate-900/50 border border-white/5 px-3 py-2 text-sm text-white placeholder-amber-300 focus:outline-none" />
                                    <button className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-md">Subscribe</button>
                                </form>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-400">
                            © 2025 SineAI Hub. Made for storytellers in Western Visayas.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
