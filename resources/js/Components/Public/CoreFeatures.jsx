import React from 'react';

export default function CoreFeatures() {
    return (
        <section id="features" className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Hub Features</h2>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Real-time Collaboration */}
                    <div data-aos="fade-up" data-aos-delay="0" className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 p-3 rounded-md">
                                {/* chat bubbles icon */}
                                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.2-3.2A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-gray-100">Real-time Collaboration</h3>
                        </div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Connect with guild members instantly in our dedicated chatrooms.</p>
                    </div>

                    {/* Card 2: Comprehensive Project Databases */}
                    <div data-aos="fade-up" data-aos-delay="100" className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-rose-100 dark:bg-rose-900 p-3 rounded-md">
                                {/* film reel / database icon */}
                                <svg className="h-6 w-6 text-rose-600 dark:text-rose-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v6a4 4 0 004 4h10a4 4 0 004-4V7M3 7a4 4 0 014-4h10a4 4 0 014 4M7 7v10M17 7v10" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-gray-100">Comprehensive Project Databases</h3>
                        </div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Upload and showcase your work in a professional portfolio.</p>
                    </div>

                    {/* Card 3: Integrated Open-Source AI Tools */}
                    <div data-aos="fade-up" data-aos-delay="200" className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md">
                                {/* robot / spark icon */}
                                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m6.364 1.636l-1.414 1.414M20 12h-2M17.657 18.364l-1.414-1.414M12 20v-2M6.343 18.364l1.414-1.414M4 12H6M6.343 5.636L7.757 7.05" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-gray-100">Integrated Open-Source AI Tools</h3>
                        </div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Leverage our AI assistant, Spark, to accelerate your creative process from script to storyboard.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
