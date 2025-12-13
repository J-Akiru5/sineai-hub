// resources/js/Pages/Projects/Edit.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ auth, project }) {
    const { data, setData, processing, errors, progress } = useForm({
        title: project.title || '',
        description: project.description || '',
        video: null, // optional replacement
        thumbnail: null,
        is_premiere_public: project.is_premiere_public ?? false,
        category: project.category || '',
        visibility: project.visibility || 'private',
    });

    const submit = (e) => {
        e.preventDefault();

        // Use POST with method spoofing to ensure multipart/form-data (file) uploads
        // send the freshest `data` object to the backend to avoid stale state issues.
        router.post(route('projects.update', project.id), {
            _method: 'patch',
            ...data,
        });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Edit Project</h2>}
        >
            <Head title={`Edit ${project.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-amber-100">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <InputLabel htmlFor="title" value="Project Title" />
                                    <TextInput
                                        id="title"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    <InputError message={errors.title} className="mt-2 text-amber-200/80" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full bg-slate-800/30 border border-white/6 rounded-md text-amber-100 p-3"
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="4"
                                    ></textarea>
                                    <InputError message={errors.description} className="mt-2 text-amber-200/80" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="video" value="Replace Video (optional)" />
                                    <input
                                        id="video"
                                        type="file"
                                        name="video"
                                        className="mt-1 block w-full text-amber-200"
                                        onChange={(e) => setData('video', e.target.files[0])}
                                    />
                                    <InputError message={errors.video} className="mt-2 text-amber-200/80" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="thumbnail" value="Thumbnail (optional)" />
                                    <input
                                        id="thumbnail"
                                        type="file"
                                        name="thumbnail"
                                        className="mt-1 block w-full text-amber-200"
                                        onChange={(e) => setData('thumbnail', e.target.files[0])}
                                    />
                                    <InputError message={errors.thumbnail} className="mt-2 text-amber-200/80" />
                                </div>

                                <div className="mb-4 flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={data.is_premiere_public} onChange={(e) => setData('is_premiere_public', e.target.checked)} />
                                        <span className="ml-2">Publish to Premiere (Public)</span>
                                    </label>
                                    <div className="ml-auto w-1/3">
                                        <InputLabel htmlFor="category" value="Category" />
                                        <select id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} className="w-full mt-1 border rounded px-2 py-1 bg-slate-800/20 text-amber-100">
                                            <option value="">Select category</option>
                                            <option value="Short Film">Short Film</option>
                                            <option value="Documentary">Documentary</option>
                                            <option value="Music Video">Music Video</option>
                                            <option value="Experimental">Experimental</option>
                                        </select>
                                        <InputError message={errors.category} className="mt-2 text-amber-200/80" />
                                    </div>
                                </div>
                                <div className="mb-4 w-1/3">
                                    <InputLabel htmlFor="visibility" value="Visibility" />
                                    <select id="visibility" value={data.visibility} onChange={(e) => setData('visibility', e.target.value)} className="w-full mt-1 border rounded px-2 py-1 bg-slate-800/20 text-amber-100">
                                        <option value="private">Private</option>
                                        <option value="public">Public</option>
                                        <option value="unlisted">Unlisted</option>
                                    </select>
                                    <InputError message={errors.visibility} className="mt-2 text-amber-200/80" />
                                </div>

                                {progress && (
                                    <div className="w-full bg-slate-800/20 rounded-full mb-4">
                                        <div className="bg-amber-500 text-xs font-medium text-slate-900 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress.percentage}%` }}>
                                            {progress.percentage}%
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ml-4 bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900" disabled={processing}>
                                        Update Project
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
