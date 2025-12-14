import React from 'react';
import { Link } from '@inertiajs/react';

export default function CinemaCard({ project }) {
    const thumb = project?.thumbnail_url || project?.video_url || '';

    return (
        <Link href={route('premiere.show', project.id)} className="group relative block w-64 md:w-72 flex-shrink-0">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900 transition duration-300 ease-out group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/70">
                <img src={thumb} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/35">
                    <div className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold shadow-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                            <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
                        </svg>
                        <span>Quick Play</span>
                    </div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div>
                        <div className="text-white font-semibold drop-shadow">{project.title}</div>
                        <div className="text-sm text-amber-300">{project.user?.name}</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
