import React from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import Hero from '@/Components/Premiere/Hero';
import { Head } from '@inertiajs/react';
import CinemaCard from '@/Components/Premiere/CinemaCard';

export default function Index({ featured, featuredProject, newArrivals, trending }) {
    return (
        <CinemaLayout>
            <Head title="Premiere" />

            {/* Hero */}
            {(featuredProject || featured) && (
                <Hero featuredProject={featuredProject || featured} />
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
