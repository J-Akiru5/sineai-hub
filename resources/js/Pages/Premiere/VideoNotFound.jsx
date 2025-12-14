import React from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head, Link } from '@inertiajs/react';

export default function VideoNotFound({ message }) {
    return (
        <CinemaLayout>
            <Head title="Video Not Found" />

            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="mb-6">
                        <svg
                            className="mx-auto h-24 w-24 text-amber-500/50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">Video Unavailable</h1>
                    
                    <p className="text-amber-200/80 mb-8">
                        {message || 'This video has been removed or is no longer available.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={route('premiere.index')}
                            className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition"
                        >
                            Browse Premiere
                        </Link>
                        <Link
                            href={route('dashboard')}
                            className="px-6 py-3 bg-slate-800 text-amber-200 rounded-lg hover:bg-slate-700 transition"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
