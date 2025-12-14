import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const VIDEO_FORMATS_REGEX = /\.(mp4|webm|ogg)(\?|$)/i;

export default function CinemaCard({ project }) {
    const thumb = project?.thumbnail_url || project?.video_url || '';
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);
    const isVideo = !!(project?.video_url && VIDEO_FORMATS_REGEX.test(project.video_url));

    useEffect(() => {
        if (!videoRef.current) return;
        if (isHovered) {
            videoRef.current.play().catch((error) => console.warn('Video autoplay failed:', error));
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isHovered]);

    return (
        <Link
            href={route('premiere.show', project.id)}
            className="group relative block w-64 md:w-72 flex-shrink-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900 transition duration-300 ease-out transform-gpu will-change-transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/70 group-hover:z-50 shadow-xl">
                {isVideo && (
                    <video
                        ref={videoRef}
                        src={project.video_url}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}
                <img
                    src={thumb}
                    alt={project.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered && isVideo ? 'opacity-0' : 'opacity-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

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
