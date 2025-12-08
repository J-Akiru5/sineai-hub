import React from 'react';

export default function AboutUs() {
    return (
        <section id="about" className="py-16 bg-slate-950 text-amber-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-semibold text-amber-100">About the Guild</h2>

                <div className="mt-4 max-w-3xl text-lg text-amber-200/90" data-aos="fade-right" data-aos-delay="0">
                    <p>
                        The SineAI Hub is a community of creators, engineers, and storytellers building AI-first tools and
                        workflows for content creation. We provide infrastructure, education, and collaboration spaces for
                        members to ship projects and learn from each other.
                    </p>
                </div>

                {/* Vision subsection ported from Vision.jsx */}
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold text-amber-100">Our Vision</h3>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="text-lg text-amber-200/90">
                            <p>
                                To build a centralized digital hub for members to connect, collaborate, and innovate,
                                driving the new 'Visayan Wave' in AI cinema.
                            </p>
                        </div>

                        <div data-aos="fade-left" data-aos-delay="120">
                            <ul className="space-y-4">
                                {[
                                    'Achieve national recognition.',
                                    'Host workshops and competitions.',
                                    'Build a comprehensive library of AI tools and resources.',
                                    'Create a strong network connecting students with industry professionals.',
                                ].map((t, i) => (
                                    <li key={i} className="flex items-start">
                                        <svg className="flex-shrink-0 h-6 w-6 text-amber-400 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="ml-3 text-amber-200/90">{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
