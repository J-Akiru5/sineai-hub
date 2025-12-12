import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SparkWidget from '@/Components/SparkWidget';

export default function PublicLayout({ title = 'SineAI Hub', children }) {
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

                        <nav className="flex-1 flex items-center justify-center">
                            <div className="hidden sm:flex space-x-8">
                                <a href="#about" className="text-sm text-amber-200/90 hover:underline">About</a>
                                <a href="#features" className="text-sm text-amber-200/90 hover:underline">Features</a>
                                <a href="#team" className="text-sm text-amber-200/90 hover:underline">Team</a>
                            </div>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm text-amber-200/80 hover:underline">Login</Link>
                            <Link href="/register" className="cta-primary hidden sm:inline-flex">Register</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <SparkWidget />

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
