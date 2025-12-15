import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import SparkWidget from '@/Components/SparkWidget';

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
                                <Link href="/" className="inline-block">
                                    <img src="/images/logo.png" alt="SineAI Hub" className="h-12 w-auto" />
                                </Link>
                                <p className="text-sm">Empowering Visayan filmmakers with AI-driven creativity. The official digital ecosystem for the SineAI Guild of Western Visayas.</p>
                                <div className="flex items-center gap-4 pt-2">
                                    <a href="https://facebook.com/sineaiguild" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                                    </a>
                                    <a href="https://instagram.com/sineaiguild" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-400 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    </a>
                                    <a href="https://youtube.com/@sineaiguild" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                    </a>
                                    <a href="https://tiktok.com/@sineaiguild" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                                    </a>
                                </div>
                            </div>

                            {/* Column 2 - Platform */}
                            <div>
                                <h4 className="text-amber-500 font-bold mb-4">Platform</h4>
                                <ul className="space-y-2">
                                    <li><Link href="/" className="hover:underline hover:text-amber-200 transition-colors">Home</Link></li>
                                    <li><Link href={route('premiere.index')} className="hover:underline hover:text-amber-200 transition-colors">Premiere</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Scriptwriter</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Spark AI Assistant</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Community Chat</Link></li>
                                </ul>
                            </div>

                            {/* Column 3 - Guild */}
                            <div>
                                <h4 className="text-amber-500 font-bold mb-4">The Guild</h4>
                                <ul className="space-y-2">
                                    <li><a href="#about" className="hover:underline hover:text-amber-200 transition-colors">About Us</a></li>
                                    <li><a href="#team" className="hover:underline hover:text-amber-200 transition-colors">Leadership Team</a></li>
                                    <li><a href="#features" className="hover:underline hover:text-amber-200 transition-colors">Core Features</a></li>
                                    <li><Link href={route('register')} className="hover:underline hover:text-amber-200 transition-colors">Join the Guild</Link></li>
                                    <li><Link href={route('login')} className="hover:underline hover:text-amber-200 transition-colors">Member Login</Link></li>
                                </ul>
                            </div>

                            {/* Column 4 - Contact */}
                            <div>
                                <h4 className="text-amber-500 font-bold mb-4">Connect With Us</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span>Western Visayas, Philippines</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <a href="mailto:sineaiguild@gmail.com" className="hover:text-amber-200 transition-colors">sineaiguild@gmail.com</a>
                                    </li>
                                </ul>

                                <div className="mt-6">
                                    <p className="text-xs text-slate-500 mb-2">Stay updated with guild announcements</p>
                                    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                                        <input type="email" placeholder="Your email" className="flex-1 rounded-md bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                                        <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-md text-sm transition-colors">Subscribe</button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-slate-500">
                                © {new Date().getFullYear()} SineAI Guild of Western Visayas. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                                <a href="#" className="text-slate-500 hover:text-amber-200 transition-colors">Privacy Policy</a>
                                <a href="#" className="text-slate-500 hover:text-amber-200 transition-colors">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
