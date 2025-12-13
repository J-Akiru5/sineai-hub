import React from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import CommentSection from '@/Components/Premiere/CommentSection';

export default function Show({ project, suggestedVideos, comments }) {
    return (
        <CinemaLayout>
            <Head title={project.title} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-black">
                            <video src={project.video_url} controls autoPlay className="w-full aspect-video bg-black" />
                        </div>

                        <div className="mt-6 text-white">
                            <h1 className="text-3xl font-bold">{project.title}</h1>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden">
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

                                <div className="ml-auto flex items-center gap-3">
                                    <button className="px-3 py-1 bg-amber-500 text-black rounded">Add to Playlist</button>
                                    <button className="px-3 py-1 bg-slate-800 text-amber-200 rounded">Report</button>
                                </div>
                            </div>

                            <div className="mt-4 text-amber-200">
                                {project.description}
                            </div>

                            <div className="mt-6">
                                <CommentSection comments={comments} projectId={project.id} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <SuggestedVideos videos={suggestedVideos} />
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
