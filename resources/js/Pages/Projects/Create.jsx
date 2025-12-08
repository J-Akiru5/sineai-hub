// resources/js/Pages/Projects/Create.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth }) {
    // useForm is Inertia's way of managing form state
    const { data, setData, post, processing, errors, progress } = useForm({
        title: '',
        description: '',
        video: null, // File inputs are handled as null initially
    });

    const submit = (e) => {
        e.preventDefault();
        // The 'post' helper will send the form data to the named route 'projects.store'
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Upload New Project</h2>}
        >
            <Head title="Upload Project" />

            <div className="py-12">
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
                                    <InputLabel htmlFor="video" value="Video File" />
                                    <input
                                        id="video"
                                        type="file"
                                        name="video"
                                        className="mt-1 block w-full text-amber-200"
                                        onChange={(e) => setData('video', e.target.files[0])}
                                    />
                                    <InputError message={errors.video} className="mt-2 text-amber-200/80" />
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
                                        Upload Project
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