import React from 'react';
import { Link } from '@inertiajs/react';

const resolveGenre = (project) => project?.genre ?? project?.category ?? project?.category_name ?? 'Feature';
const DEFAULT_BADGES = {
    quality: '4K Ultra',
    audio: 'Dolby Atmos',
};

export default function Hero({ featuredProject }) {
    if (!featuredProject) return null;

    const bgUrl = featuredProject.thumbnail_url || featuredProject.video_url || null;
    const badges = [
        featuredProject?.quality || DEFAULT_BADGES.quality,
        featuredProject?.audio || DEFAULT_BADGES.audio,
        resolveGenre(featuredProject),
    ].filter(Boolean);

    return (
        <section className="relative w-full h-[85vh] text-white overflow-hidden">
            <div className="absolute inset-0">
                <div
                    className={`absolute inset-0 bg-center bg-cover ${!bgUrl ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700' : ''}`}
                    style={bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {}}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.9)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* Foreground content */}
            <div className="relative z-10 h-full flex items-end px-6 sm:px-10 lg:px-16 pb-24">
                <div className="max-w-4xl space-y-5">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-amber-200 font-semibold">
                        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur">Premiere</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        {featuredProject.title}
                    </h1>

                    <div className="flex items-center flex-wrap gap-3 text-sm">
                        {badges.map((badge, idx) => (
                            <span key={`${badge}-${idx}`} className="px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur">
                                {badge}
                            </span>
                        ))}
                    </div>

                    <p className="text-lg text-gray-100/90 max-w-3xl line-clamp-3 drop-shadow-[0_5px_18px_rgba(0,0,0,0.65)]">
                        {featuredProject.description}
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            href={route('premiere.show', featuredProject.id)}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400 text-black rounded-full font-semibold shadow-lg shadow-amber-500/30 hover:bg-amber-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                                <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
                            </svg>
                            <span>Play</span>
                        </Link>

                        <Link
                            href={route('premiere.show', featuredProject.id)}
                            className="inline-flex items-center gap-3 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-full backdrop-blur hover:bg-white/15 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6v6m0 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>More Info</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
