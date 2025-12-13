import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function ProjectCard({ project }) {
    const mediaUrl = project?.thumbnail_url || project?.video_url || null;
    const title = project?.title ?? 'Untitled Project';
    const creator = project?.user?.name ?? 'Unknown Creator';
    const [broken, setBroken] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Detect common video file extensions in the URL
    const isVideo = !!(project?.video_url && /\.(mp4|webm|ogg)(\?|$)/i.test(project.video_url));

    return (
        <Link
            href={route('projects.show', project.id)}
            className="block rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 overflow-hidden transform transition duration-200 ease-in-out hover:scale-[1.03]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card is navigation-only; delete/management moved to project show page */}
            <div className="relative w-full pb-[56.25%] bg-slate-700">
                {!broken ? (
                    // If hovered and we have a video URL, show autoplaying muted preview
                    (isHovered && isVideo) ? (
                        <video
                            src={project.video_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster={project.thumbnail_url || '/images/video-placeholder.jpg'}
                            className="absolute inset-0 w-full h-full object-cover bg-black"
                            onError={() => setBroken(true)}
                        />
                    ) : (
                            // Default: show thumbnail if available, otherwise a styled placeholder
                            project?.thumbnail_url ? (
                                <img
                                    src={project.thumbnail_url}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={() => setBroken(true)}
                            />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4l-4.553-2.276A1 1 0 009 8.618v6.764a1 1 0 001.447.894L15 14m0-4v4" />
                                    </svg>
                                </div>
                            )
                        )
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            {/* Placeholder when no media is provided or file not found */}
                        <div className="text-center">
                                <div className="text-sm font-medium">File Not Found</div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mx-auto mt-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-900/20">
                <div className="text-amber-100 font-semibold text-lg truncate">{title}</div>
                <div className="text-amber-300 text-sm mt-1">{creator}</div>
            </div>
        </Link>
    );
}
