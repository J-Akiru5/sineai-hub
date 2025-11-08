import React from 'react';
import { Link } from '@inertiajs/react';

export default function CallToAction() {
    return (
        <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ready to Join the Visayan Wave?</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Become a part of the pioneering community of AI filmmakers. Register now to connect with creators, showcase your work, and build the future of cinema.</p>
                <div className="mt-6">
                    <Link href="/register" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:opacity-95">Create Your Account</Link>
                </div>
            </div>
        </section>
    );
}
