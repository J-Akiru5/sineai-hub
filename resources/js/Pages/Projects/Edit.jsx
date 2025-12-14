// resources/js/Pages/Projects/Edit.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ auth, project }) {
    const { data, setData, processing, errors, progress, post } = useForm({
        _method: 'PATCH',
        title: project.title || '',
        description: project.description || '',
        category: project.category || '',
        visibility: project.visibility || 'private',
        video: null,
        thumbnail: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Edit Project</h2>}
        >
            <Head title={`Edit ${project.title}`} />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold text-white">Update Project</h3>
                                <p className="text-sm text-amber-200/80 mt-1">Update your project details below. To replace your media, simply upload a new video or thumbnail; otherwise, leave them blank to keep the current ones.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-amber-100">Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 w-full rounded-lg bg-slate-800/40 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400"
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2 text-amber-200/80" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-amber-100">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-1 w-full rounded-lg bg-slate-800/40 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400"
                                    />
                                    <InputError message={errors.description} className="mt-2 text-amber-200/80" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-amber-100">Category</label>
                                        <input
                                            type="text"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="mt-1 w-full rounded-lg bg-slate-800/40 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400"
                                        />
                                        <InputError message={errors.category} className="mt-2 text-amber-200/80" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-100">Visibility</label>
                                        <select
                                            value={data.visibility}
                                            onChange={(e) => setData('visibility', e.target.value)}
                                            className="mt-1 w-full rounded-lg bg-slate-800/40 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400"
                                        >
                                            <option value="private">Private</option>
                                            <option value="public">Public</option>
                                            <option value="unlisted">Unlisted</option>
                                        </select>
                                        <InputError message={errors.visibility} className="mt-2 text-amber-200/80" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-amber-100">Replace Video (optional)</label>
                                        <input
                                            type="file"
                                            accept="video/mp4,video/quicktime"
                                            onChange={(e) => setData('video', e.target.files[0])}
                                            className="mt-2 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400 bg-slate-800/40 border border-white/10 rounded-lg"
                                        />
                                        <InputError message={errors.video} className="mt-2 text-amber-200/80" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-100">Thumbnail (optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('thumbnail', e.target.files[0])}
                                            className="mt-2 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400 bg-slate-800/40 border border-white/10 rounded-lg"
                                        />
                                        <InputError message={errors.thumbnail} className="mt-2 text-amber-200/80" />
                                    </div>
                                </div>

                                {progress && (
                                    <div className="w-full bg-slate-800/40 rounded-full mb-2">
                                        <div
                                            className="bg-amber-500 text-xs font-medium text-slate-900 text-center p-0.5 leading-none rounded-full"
                                            style={{ width: `${progress.percentage}%` }}
                                        >
                                            {progress.percentage}%
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <PrimaryButton
                                        className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 hover:from-amber-300 hover:to-amber-500"
                                        disabled={processing}
                                    >
                                        {processing ? 'Uploading...' : 'Update Project'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
