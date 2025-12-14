import React from 'react';
import { Link } from '@inertiajs/react';
import { Play, Film } from 'lucide-react';

export default function BoxOffice({ projects = [] }) {
    // Placeholder projects if no real projects exist
    const placeholderProjects = [
        { id: 'placeholder-1', title: 'Coming Soon', user: { name: 'SineAI Guild' }, thumbnail_url: null },
        { id: 'placeholder-2', title: 'Your Film Here', user: { name: 'Join Us' }, thumbnail_url: null },
        { id: 'placeholder-3', title: 'Be the First', user: { name: 'Upload Today' }, thumbnail_url: null },
    ];

    const displayProjects = projects.length > 0 ? projects : placeholderProjects;
    const hasRealProjects = projects.length > 0;

    return (
        <section id="box-office" className="py-20 bg-slate-950 text-amber-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-bold text-amber-100">Made in Western Visayas</h2>
                    <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-amber-200/70 max-w-2xl mx-auto">
                        Discover films crafted by our talented guild members. Every story, every frame — proudly Visayan.
                    </p>
                </div>

                {/* Cinematic Posters Grid - 2:3 Aspect Ratio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayProjects.map((project, index) => (
                        <div
                            key={project.id}
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            className="group relative"
                        >
                            {hasRealProjects ? (
                                <Link href={route('premiere.show', project.id)} className="block">
                                    <PosterCard project={project} />
                                </Link>
                            ) : (
                                <Link href={route('register')} className="block">
                                    <PlaceholderPoster project={project} />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {hasRealProjects && (
                    <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="400">
                        <Link
                            href={route('premiere.index')}
                            className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-xl text-amber-200 border border-white/20 rounded-lg transform transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/10 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                        >
                            View All Films
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

function PosterCard({ project }) {
    return (
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-amber-500/20">
            {/* Poster Image */}
            {project.thumbnail_url ? (
                <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Film className="w-16 h-16 text-slate-600" />
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{project.title}</h3>
                <p className="text-sm text-amber-200/80">{project.user?.name || 'Unknown Creator'}</p>
            </div>

            {/* Watch Now Button - Appears on Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg shadow-amber-500/30 transform group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                    </div>
                    <span className="px-4 py-2 bg-amber-500 text-slate-900 text-sm font-bold rounded-lg shadow-lg">
                        Watch Now
                    </span>
                </div>
            </div>

            {/* Film Strip Decorative Border */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-black/50 flex items-center justify-around px-2 opacity-50">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 bg-white/30 rounded-sm" />
                ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/50 flex items-center justify-around px-2 opacity-50">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 bg-white/30 rounded-sm" />
                ))}
            </div>
        </div>
    );
}

function PlaceholderPoster({ project }) {
    return (
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 shadow-xl transform transition-all duration-500 group-hover:scale-105 group-hover:border-amber-500/30">
            {/* Placeholder Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Film className="w-10 h-10 text-amber-500/60" />
                </div>
                <h3 className="text-xl font-bold text-amber-100/70 mb-2">{project.title}</h3>
                <p className="text-sm text-amber-200/50">{project.user?.name}</p>
            </div>

            {/* CTA on Hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="px-4 py-2 bg-amber-500 text-slate-900 text-sm font-bold rounded-lg shadow-lg">
                    Join & Upload
                </span>
            </div>

            {/* Decorative Film Strip */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-black/30 flex items-center justify-around px-2 opacity-30">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 bg-white/20 rounded-sm" />
                ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/30 flex items-center justify-around px-2 opacity-30">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-3 h-2 bg-white/20 rounded-sm" />
                ))}
            </div>
        </div>
    );
}
