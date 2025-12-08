import React from 'react';

export default function ProjectCard({ project }) {
    const thumbnail = project?.thumbnail_url;
    const title = project?.title ?? 'Untitled Project';
    const creator = project?.user?.name ?? 'Unknown Creator';

    return (
        <a
            href={project?.id ? `/projects/${project.id}` : '#'}
            className="block rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 overflow-hidden transform transition duration-200 ease-in-out hover:scale-[1.03]"
        >
            <div className="relative w-full pb-[56.25%] bg-slate-700">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        {/* Placeholder when no thumbnail is provided */}
                        <div className="text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l6 6-6 6" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="text-white font-semibold text-lg truncate">{title}</div>
                <div className="text-amber-500 text-sm mt-1">{creator}</div>
            </div>
        </a>
    );
}
