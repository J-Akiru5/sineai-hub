import React from 'react';
import { Link } from '@inertiajs/react';

export default function Hero({ featuredProject }) {
    if (!featuredProject) return null;

    const bgUrl = featuredProject.thumbnail_url || featuredProject.video_url || null;

    return (
        <section className="w-full h-[70vh] relative">
            <div
                className={`absolute inset-0 bg-center bg-cover ${!bgUrl ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700' : ''}`}
                style={bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {}}
            />

            {/* Blurred overlay */}
            <div className="absolute inset-0 backdrop-blur-md" />

            {/* Gradient overlay from left to transparent */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

            {/* Foreground content */}
            <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-6">
                <div className="max-w-2xl text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">{featuredProject.title}</h1>
                    <p className="text-amber-200 mb-6 line-clamp-3">{featuredProject.description}</p>

                    <div className="flex items-center gap-4">
                        <Link href={route('premiere.show', featuredProject.id)} className="inline-flex items-center gap-2 px-5 py-3 bg-amber-400 text-black rounded-lg font-semibold">
                            <span>▶ Play</span>
                        </Link>

                        <Link href={route('premiere.show', featuredProject.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg">
                            More Info
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
