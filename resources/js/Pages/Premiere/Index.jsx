import React, { useRef } from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import Hero from '@/Components/Premiere/Hero';
import { Head } from '@inertiajs/react';
import CinemaCard from '@/Components/Premiere/CinemaCard';

export default function Index({ featured, featuredProject, newArrivals, trending }) {
    const newArrivalsRef = useRef(null);
    const trendingRef = useRef(null);

    const scrollRow = (ref, direction = 1) => {
        if (!ref?.current) return;
        const scrollAmount = ref.current.clientWidth * 0.8 * direction;
        ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const renderRow = (title, data, ref) => (
        <div className="mb-12 relative group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-extrabold text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                    {title}
                </h3>
            </div>

            <div className="overflow-hidden">
                <div
                    ref={ref}
                    className="flex gap-4 overflow-x-scroll scroll-smooth pb-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {data && data.map((p) => (
                        <CinemaCard key={p.id} project={p} />
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={() => scrollRow(ref, -1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover:opacity-100 transition bg-white/10 border border-white/20 backdrop-blur-lg rounded-full p-2 text-white shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                type="button"
                onClick={() => scrollRow(ref, 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 opacity-0 group-hover:opacity-100 transition bg-white/10 border border-white/20 backdrop-blur-lg rounded-full p-2 text-white shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );

    return (
        <CinemaLayout>
            <Head title="Premiere" />

            {/* Hero */}
            {(featuredProject || featured) && (
                <Hero featuredProject={featuredProject || featured} />
            )}

            <div className="px-6 sm:px-8 lg:px-12 xl:px-16 py-12">
                {renderRow('New Arrivals', newArrivals, newArrivalsRef)}
                {renderRow('Trending Now', trending, trendingRef)}
            </div>
        </CinemaLayout>
    );
}
