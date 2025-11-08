import React from 'react';

export default function AboutUs() {
    return (
        <section id="about" className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">About the Guild</h2>

                <div className="mt-4 max-w-3xl text-lg text-gray-700 dark:text-gray-300">
                    <p>
                        The SineAI Hub is a community of creators, engineers, and storytellers building AI-first tools and
                        workflows for content creation. We provide infrastructure, education, and collaboration spaces for
                        members to ship projects and learn from each other.
                    </p>
                </div>

                {/* Vision subsection ported from Vision.jsx */}
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Our Vision</h3>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="text-lg text-gray-700 dark:text-gray-300">
                            <p>
                                To build a centralized digital hub for members to connect, collaborate, and innovate,
                                driving the new 'Visayan Wave' in AI cinema.
                            </p>
                        </div>

                        <div>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">Achieve national recognition.</span>
                                </li>

                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">Host workshops and competitions.</span>
                                </li>

                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">Build a comprehensive library of AI tools and resources.</span>
                                </li>

                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">Create a strong network connecting students with industry professionals.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
