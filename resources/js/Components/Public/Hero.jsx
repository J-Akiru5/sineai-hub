import React from 'react';
import { Link } from '@inertiajs/react';

export default function Hero() {
    return (
        <section className="relative overflow-hidden h-screen">
            {/* background overlay similar to nefa's cover-gradient-2 */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(169.4deg, rgba(57,132,244,0.10) -6.01%, rgba(12,211,255,0.10) 36.87%, rgba(47,124,240,0.10) 78.04%, rgba(14,101,232,0.10) 103.77%)',
                    zIndex: 0,
                }}
            />

            <div className="relative z-10 bg-gradient-to-br from-indigo-700 via-purple-600 to-sky-500 text-white h-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 h-full flex items-center">
                    <div className="text-center w-full">
                        <h1 data-aos="fade-up" data-aos-delay="0" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-indigo-200">
                            SineAI Guild of Western Visayas
                        </h1>

                        <p data-aos="fade-up" data-aos-delay="120" className="mt-4 text-xl sm:text-2xl text-indigo-100">Creating a Visayan Wave of AI in Filmmaking</p>

                        <p data-aos="fade-up" data-aos-delay="220" className="mt-6 max-w-3xl mx-auto text-lg text-indigo-100/90">The official digital ecosystem for the pioneering community of AI-assisted filmmakers in the region. Connect, create, and showcase the future of cinema.</p>

                        <div data-aos="fade-up" data-aos-delay="320" className="mt-8 flex items-center justify-center gap-4">
                            <Link
                                href="/register"
                                data-aos="zoom-in"
                                data-aos-delay="360"
                                className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-md shadow transform transition-transform duration-300 ease-out hover:-translate-y-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:bg-indigo-900 hover:text-white"
                            >
                                Join the Guild
                            </Link>

                            <Link
                                href="/projects"
                                data-aos="zoom-in"
                                data-aos-delay="420"
                                className="inline-flex items-center px-5 py-3 bg-transparent text-white border border-white/20 rounded-md transform transition-transform duration-300 ease-out hover:-translate-y-2 hover:bg-white hover:text-indigo-700 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                Explore Projects
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
