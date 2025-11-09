import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PublicLayout({ title = 'SineAI Hub', children }) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Head title={title} />

            <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="text-lg font-semibold">SineAI Hub</div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden sm:flex space-x-4">
                            <a href="#about" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">About</a>
                            <a href="#features" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Features</a>
                            <a href="#team" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Team</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Login</Link>

                            <Link
                                href="/register"
                                className="hidden sm:inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-600 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} SineAI Hub. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
