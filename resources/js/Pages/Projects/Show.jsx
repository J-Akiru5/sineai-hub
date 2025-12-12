import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, project }) {
    const title = project?.title ?? 'Untitled Project';
    const creator = project?.user?.name ?? 'Unknown Creator';
    const description = project?.description ?? '';
    const videoUrl = project?.video_url ?? project?.thumbnail_url ?? null;

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="min-h-screen bg-slate-950 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 flex items-center justify-center">
                            <div className="w-full">
                                {videoUrl ? (
                                    <div className="w-full bg-black rounded-lg overflow-hidden">
                                        <video
                                            controls
                                            preload="none"
                                            playsInline
                                            disableRemotePlayback
                                            poster={project.thumbnail_url || '/images/video-placeholder.jpg'}
                                            className="w-full h-[480px] md:h-[560px] object-cover bg-black"
                                        >
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <div className="w-full h-[480px] md:h-[560px] bg-slate-800 rounded-lg flex items-center justify-center text-slate-300">
                                        No media available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                                <h1 className="text-2xl font-bold text-amber-200">{title}</h1>
                                <div className="text-sm text-amber-300 mt-2">By {creator}</div>

                                <div className="mt-4 text-slate-300 whitespace-pre-line">
                                    {description || 'No description provided.'}
                                </div>

                                <div className="mt-6">
                                    <Link href={route('projects.index')} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-slate-900 font-semibold rounded-lg shadow-md">
                                        Back to Gallery
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
