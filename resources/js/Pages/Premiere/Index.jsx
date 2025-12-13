import React from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head } from '@inertiajs/react';
import CinemaCard from '@/Components/Premiere/CinemaCard';

export default function Index({ featured, newArrivals, trending }) {
    return (
        <CinemaLayout>
            <Head title="Premiere" />

            {/* Hero */}
            {featured && (
                <section className="relative h-[60vh] bg-black">
                    <div className="absolute inset-0">
                        <img src={featured.thumbnail_url || featured.video_url} alt={featured.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                    <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-white">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{featured.title}</h1>
                        <p className="text-amber-200 mb-6 max-w-2xl">{featured.description}</p>
                        <div>
                            <a href={route('premiere.show', featured.id)} className="inline-block px-6 py-3 bg-amber-400 text-black rounded-lg font-semibold">Watch Now</a>
                        </div>
                    </div>
                </section>
            )}

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* New Arrivals Row */}
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-white mb-4">New Arrivals</h3>
                    <div className="flex gap-4 overflow-x-auto py-2">
                        {newArrivals && newArrivals.map((p) => (
                            <CinemaCard key={p.id} project={p} />
                        ))}
                    </div>
                </div>

                {/* Trending Row */}
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-white mb-4">Trending Now</h3>
                    <div className="flex gap-4 overflow-x-auto py-2">
                        {trending && trending.map((p) => (
                            <CinemaCard key={p.id} project={p} />
                        ))}
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
