import React from 'react';
import { Link } from '@inertiajs/react';

export default function CinemaCard({ project }) {
    const thumb = project?.thumbnail_url || project?.video_url || '';

    return (
        <Link href={route('premiere.show', project.id)} className="relative block w-64 flex-shrink-0">
            <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg transform transition duration-200 hover:scale-105 hover:z-20">
                <div className="absolute inset-0 bg-black/40"></div>
                <img src={thumb} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-end p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div>
                        <div className="text-white font-semibold">{project.title}</div>
                        <div className="text-sm text-amber-300">{project.user?.name}</div>
                    </div>
                    <div className="ml-auto">
                        <div className="bg-amber-400 text-black rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 3.5v13l11-6.5-11-6.5z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
