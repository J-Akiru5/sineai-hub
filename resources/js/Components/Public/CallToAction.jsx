import React from 'react';
import { Link } from '@inertiajs/react';

export default function CallToAction() {
    return (
        <section className="py-16">
            <div data-aos="fade-up" data-aos-delay="140" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ready to Join the Visayan Wave?</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Become a part of the pioneering community of AI filmmakers. Register now to connect with creators, showcase your work, and build the future of cinema.</p>
                <div className="mt-6">
                    <Link
                        href="/register"
                        data-aos="zoom-in"
                        data-aos-delay="220"
                        data-aos-duration="500"
                        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:opacity-95 transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Create Your Account
                    </Link>
                </div>
            </div>
        </section>
    );
}
