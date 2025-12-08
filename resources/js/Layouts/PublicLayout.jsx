import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PublicLayout({ title = 'SineAI Hub', children }) {
    return (
        <div className="relative min-h-screen bg-slate-950 text-white">
            <Head title={title} />

            {/* background blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-72 -left-72 w-[30rem] h-[30rem] bg-red-900/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-60 -right-56 w-[28rem] h-[28rem] bg-red-900/20 rounded-full blur-3xl opacity-25" />
            </div>

            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="inline-flex items-baseline gap-1 no-underline">
                            <span className="text-lg font-semibold tracking-tight">SineAI</span>
                            <span className="text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sineai-red-700 to-sineai-gold">Hub</span>
                        </Link>

                        <nav className="hidden sm:flex space-x-6 text-white">
                            <a href="#about" className="text-sm text-slate-300 hover:underline">About</a>
                            <a href="#features" className="text-sm text-slate-300 hover:underline">Features</a>
                            <a href="#team" className="text-sm text-slate-300 hover:underline">Team</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-slate-300 hover:underline">Login</Link>
                        <Link href="/register" className="cta-primary hidden sm:inline-flex">Register</Link>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="glass-card p-4 flex items-center justify-between">
                        <div className="text-slate-400 text-sm">© {new Date().getFullYear()} SineAI Hub — Made for storytellers.</div>
                        <div className="text-slate-400 text-sm">Public</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
