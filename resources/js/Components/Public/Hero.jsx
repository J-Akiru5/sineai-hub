import React from 'react';
import { Link } from '@inertiajs/react';

export default function Hero() {
    return (
        <section className="relative overflow-hidden min-h-screen">

            {/* Background cover image */}
            <img src="/images/bg-library.jpg" alt="Library background" className="absolute inset-0 w-full h-full object-cover z-0" />

            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30 z-10" aria-hidden="true" />

            <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
                <div className="max-w-6xl">
                    <h1 data-aos="fade-up" data-aos-delay="0" className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-widest leading-tight bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-2xl">
                        SineAI Guild of Western Visayas
                    </h1>

                    <p data-aos="fade-up" data-aos-delay="120" className="mt-4 text-amber-500/80 tracking-[0.5em] text-sm md:text-base uppercase font-bold">
                        Creating a Visayan Wave of AI in Filmmaking
                    </p>

                    <p data-aos="fade-up" data-aos-delay="220" className="mt-6 max-w-3xl mx-auto text-lg text-amber-200/80">
                        The official digital ecosystem for the pioneering community of AI-assisted filmmakers in the region. Connect, create, and showcase the future of cinema.
                    </p>

                    {/* <div data-aos="fade-up" data-aos-delay="320" className="mt-8 flex items-center justify-center gap-4"> */}
                    {/* <Link
                            href="/register"
                            data-aos="zoom-in"
                            data-aos-delay="360"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-semibold rounded-md shadow transform transition-transform duration-300 ease-out hover:-translate-y-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            Join the Guild
                        </Link> */}

                    {/* <Link
                        href="/projects"
                        data-aos="zoom-in"
                        data-aos-delay="420"
                        className="inline-flex items-center px-5 py-3 bg-transparent text-amber-200 border border-amber-200/20 rounded-md transform transition-transform duration-300 ease-out hover:-translate-y-2 hover:bg-amber-200 hover:text-slate-900 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                    >
                        Explore Projects
                    </Link>
                    </div> */}

                </div>
            </div>

            {/* Desktop: only left glass card (no right card near Spark) */}
            <div className="hidden md:block">
                <div className="absolute bottom-12 left-8 z-30" data-aos="fade-up" data-aos-delay="320">
                    <div className="bg-white/3 dark:bg-slate-900/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg max-w-sm shadow-lg">
                        <h3 className="text-amber-100/90 font-semibold text-lg">Join the Guild</h3>
                        <p className="mt-2 text-amber-200/70 text-sm">Collaborate with creatives and access premium models.</p>
                        <div className="mt-4">
                            <Link href={route('register')} className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-br from-amber-400/90 to-amber-600/90 text-slate-900 font-bold shadow-lg">Join the Guild</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spark character - two placements for responsive behavior.
                Ensure the spark sits above other layers using Tailwind's arbitrary z-index class (e.g. z-[99]). */}}
            <img src="/images/spark.gif" alt="Spark character" className="hidden md:block absolute bottom-12 right-16 z-999 h-[40vh] w-auto pointer-events-none animate-[bounce_6s_infinite]" />

            {/* Mobile: bottom-center (overlaps glass UI slightly) */}
            <img src="/images/spark.gif" alt="Spark character" className="md:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 z-999 h-[30vh] w-auto pointer-events-none animate-[bounce_6s_infinite]" />

        </section>
    );
}
