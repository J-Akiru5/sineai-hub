import React, { useState } from 'react';

export default function ProjectCard({ project }) {
    const mediaUrl = project?.thumbnail_url || project?.video_url || null;
    const title = project?.title ?? 'Untitled Project';
    const creator = project?.user?.name ?? 'Unknown Creator';
    const [broken, setBroken] = useState(false);

    // Detect common video file extensions in the URL
    const isVideo = !!(project?.video_url && /\.(mp4|webm|ogg)(\?|$)/i.test(project.video_url));

    return (
        <a
            href={project?.id ? `/projects/${project.id}` : '#'}
            className="block rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 overflow-hidden transform transition duration-200 ease-in-out hover:scale-[1.03]"
        >
            <div className="relative w-full pb-[56.25%] bg-slate-700">
                {mediaUrl && !broken ? (
                    isVideo ? (
                        <video
                            controls
                            preload="none"
                            playsInline
                            disableRemotePlayback
                            poster={project.thumbnail_url || '/images/video-placeholder.jpg'}
                            className="absolute inset-0 w-full h-full object-cover bg-black"
                            onError={() => setBroken(true)}
                        >
                            <source src={project.video_url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                                src={mediaUrl}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={() => setBroken(true)}
                            />
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
        </a>
    );
}
