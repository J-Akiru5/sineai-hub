import React from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import CommentSection from '@/Components/Premiere/CommentSection';

export default function Show({ project, suggestedVideos, comments }) {
    return (
        <CinemaLayout>
            <Head title={project.title} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Main column: 75% width (9/12) */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-black">
                            <video
                                src={project.video_url}
                                controls
                                autoPlay
                                className="w-full h-[60vh] lg:h-[70vh] bg-black"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>

                        <div className="mt-6 text-white">
                            <h1 className="text-3xl font-bold">{project.title}</h1>

                            <div className="flex items-center gap-4 mt-3">
                                <div className="h-12 w-12 rounded-full bg-slate-700 overflow-hidden">
                                    {project.user?.avatar_url ? (
                                        <img src={project.user.avatar_url} alt={project.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-amber-300">{project.user?.name?.[0] ?? 'U'}</div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-sm text-amber-300">by {project.user?.name}</div>
                                    <div className="text-xs text-slate-400">{project.views_count ?? 0} views • {new Date(project.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="mt-4 text-amber-200">
                                {project.description}
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <button className="px-3 py-2 bg-amber-500 text-black rounded">Add to Playlist</button>
                                <button className="px-3 py-2 bg-slate-800 text-amber-200 rounded">Report</button>
                            </div>

                            <div className="mt-6">
                                <CommentSection comments={comments} projectId={project.id} />
                            </div>
                        </div>
                    </div>

                    {/* Suggestions column: 25% width (3/12) */}
                    <aside className="col-span-12 lg:col-span-3">
                        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
                            <SuggestedVideos videos={suggestedVideos} />
                        </div>
                    </aside>
                </div>
            </div>
        </CinemaLayout>
    );
}
