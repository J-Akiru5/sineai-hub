import React from 'react';
import { Link } from '@inertiajs/react';

export default function Hero() {
    return (
        <section className="relative overflow-hidden">
            {/* background overlay similar to nefa's cover-gradient-2 */}
            <div
                aria-hidden
                className="absolute -top-20 left-0 w-full h-[125vh] sm:h-[225vh] lg:h-[125vh]"
                style={{
                    background: 'linear-gradient(169.4deg, rgba(57,132,244,0.10) -6.01%, rgba(12,211,255,0.10) 36.87%, rgba(47,124,240,0.10) 78.04%, rgba(14,101,232,0.10) 103.77%)',
                    zIndex: 0,
                }}
            />

            <div className="relative z-10 bg-gradient-to-br from-indigo-700 via-purple-600 to-sky-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-indigo-200">
                            SineAI Guild of Western Visayas
                        </h1>

                        <p className="mt-4 text-xl sm:text-2xl text-indigo-100">Creating a Visayan Wave of AI in Filmmaking</p>

                        <p className="mt-6 max-w-3xl mx-auto text-lg text-indigo-100/90">The official digital ecosystem for the pioneering community of AI-assisted filmmakers in the region. Connect, create, and showcase the future of cinema.</p>

                        <div className="mt-8 flex items-center justify-center gap-4">
                            <Link href="/register" className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-md shadow hover:opacity-95">
                                Join the Guild
                            </Link>

                            <Link href="/projects" className="inline-flex items-center px-5 py-3 bg-indigo-600/20 text-white border border-white/20 rounded-md hover:bg-indigo-600/30">
                                Explore Projects
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
