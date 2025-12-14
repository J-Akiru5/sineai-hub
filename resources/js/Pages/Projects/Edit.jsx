import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    Upload,
    Film,
    Image,
    FileText,
    Eye,
    EyeOff,
    Globe,
    Lock,
    Calendar,
    Clock,
    Users,
    Tag,
    Star,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Info,
    ArrowLeft,
    Save
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Edit({ auth, project, categories = [] }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [castCrewList, setCastCrewList] = useState(
        project.cast_crew?.length > 0 ? project.cast_crew : [{ name: '', role: '' }]
    );
    const [tagsList, setTagsList] = useState(project.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [videoPreview, setVideoPreview] = useState(project.video_url || null);
    const [thumbnailPreview, setThumbnailPreview] = useState(project.thumbnail_url || null);
    const [isNewVideo, setIsNewVideo] = useState(false);
    const [isNewThumbnail, setIsNewThumbnail] = useState(false);

    const { data, setData, post, processing, errors, progress } = useForm({
        _method: 'PATCH',
        title: project.title || '',
        description: project.description || '',
        directors_note: project.directors_note || '',
        video: null,
        thumbnail: null,
        is_premiere_public: project.is_premiere_public || false,
        category: project.category || '',
        category_id: project.category_id || '',
        visibility: project.visibility || 'private',
        release_year: project.release_year || new Date().getFullYear(),
        content_rating: project.content_rating || '',
        language: project.language || 'English',
        duration: project.duration || '',
        cast_crew: project.cast_crew || [],
        tags: project.tags || [],
    });

    // Auto-expand advanced options if project has advanced data
    useEffect(() => {
        if (project.directors_note || project.release_year || project.content_rating ||
            project.language !== 'English' || project.cast_crew?.length > 0 || project.tags?.length > 0) {
            setShowAdvanced(true);
        }
    }, [project]);

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('video', file);
            setIsNewVideo(true);
            const url = URL.createObjectURL(file);
            setVideoPreview(url);

            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);
                setData('duration', Math.floor(video.duration));
            };
            video.src = url;
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            setIsNewThumbnail(true);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
        setData({
            ...data,
            category_id: categoryId,
            category: selectedCategory?.name || '',
        });
    };

    const addCastCrew = () => {
        setCastCrewList([...castCrewList, { name: '', role: '' }]);
    };

    const removeCastCrew = (index) => {
        const updated = castCrewList.filter((_, i) => i !== index);
        setCastCrewList(updated);
        setData('cast_crew', updated.filter(p => p.name.trim()));
    };

    const updateCastCrew = (index, field, value) => {
        const updated = [...castCrewList];
        updated[index][field] = value;
        setCastCrewList(updated);
        setData('cast_crew', updated.filter(p => p.name.trim()));
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tagsList.includes(tag)) {
            const updated = [...tagsList, tag];
            setTagsList(updated);
            setData('tags', updated);
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        const updated = tagsList.filter(t => t !== tag);
        setTagsList(updated);
        setData('tags', updated);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const submit = (e) => {
        e.preventDefault();

        const filteredCastCrew = castCrewList.filter(p => p.name.trim());
        setData('cast_crew', filteredCastCrew);

        post(route('projects.update', project.id), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Project Updated!',
                    text: 'Your project has been updated successfully.',
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'There was an error updating your project. Please try again.',
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                });
            },
        });
    };

    const contentRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'NR'];
    const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Hindi', 'Arabic', 'Filipino', 'Other'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('projects.my')}
                            className="p-2 hover:bg-white/5 rounded-lg transition text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="font-semibold text-xl text-amber-100 leading-tight flex items-center gap-2">
                            <Film className="w-6 h-6 text-amber-400" />
                            Edit Project
                        </h2>
                    </div>
                    <span className="text-sm text-slate-400">
                        Last updated: {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                </div>
            }
        >
            <Head title={`Edit - ${project.title}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Info Card */}
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-amber-300 mb-5 flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Basic Information
                                    </h3>

                                    <div className="space-y-5">
                                        {/* Title */}
                                        <div>
                                            <InputLabel htmlFor="title" value="Project Title *" className="text-amber-200" />
                                            <TextInput
                                                id="title"
                                                name="title"
                                                value={data.title}
                                                className="mt-1 block w-full bg-slate-800/50 border-white/10 text-white focus:border-amber-500 focus:ring-amber-500"
                                                placeholder="Enter your project title..."
                                                onChange={(e) => setData('title', e.target.value)}
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <InputLabel htmlFor="description" value="Description" className="text-amber-200" />
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={data.description}
                                                className="mt-1 block w-full bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-amber-300/40 p-4 focus:border-amber-500 focus:ring-amber-500 resize-none"
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows="4"
                                                placeholder="Describe your project, what it's about, the story..."
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>

                                        {/* Director's Note */}
                                        <div>
                                            <InputLabel htmlFor="directors_note" value="Director's Note (Optional)" className="text-amber-200" />
                                            <textarea
                                                id="directors_note"
                                                name="directors_note"
                                                value={data.directors_note}
                                                className="mt-1 block w-full bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-amber-300/40 p-4 focus:border-amber-500 focus:ring-amber-500 resize-none"
                                                onChange={(e) => setData('directors_note', e.target.value)}
                                                rows="3"
                                                placeholder="Share your vision, creative process, or behind-the-scenes thoughts..."
                                            />
                                            <InputError message={errors.directors_note} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Media Upload Card */}
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-amber-300 mb-5 flex items-center gap-2">
                                        <Film className="w-5 h-5" />
                                        Media Files
                                    </h3>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {/* Video Upload */}
                                        <div>
                                            <InputLabel htmlFor="video" value="Video File" className="text-amber-200" />
                                            <p className="text-xs text-slate-400 mb-2">Leave empty to keep current video</p>
                                            <div className="mt-2">
                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-amber-500/30 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition overflow-hidden">
                                                    {videoPreview ? (
                                                        <div className="relative w-full h-full">
                                                            <video src={videoPreview} className="h-full w-full object-cover" />
                                                            {!isNewVideo && (
                                                                <div className="absolute bottom-2 left-2 bg-black/70 text-xs text-white px-2 py-1 rounded">
                                                                    Current video
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <Film className="w-10 h-10 text-amber-500/50 mb-2" />
                                                            <p className="text-sm text-amber-300/70">Click to upload video</p>
                                                            <p className="text-xs text-amber-300/40 mt-1">MP4, MOV</p>
                                                        </div>
                                                    )}
                                                    <input
                                                        id="video"
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={handleVideoChange}
                                                    />
                                                </label>
                                            </div>
                                            <InputError message={errors.video} className="mt-2" />
                                        </div>

                                        {/* Thumbnail Upload */}
                                        <div>
                                            <InputLabel htmlFor="thumbnail" value="Thumbnail" className="text-amber-200" />
                                            <p className="text-xs text-slate-400 mb-2">Leave empty to keep current thumbnail</p>
                                            <div className="mt-2">
                                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-amber-500/30 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition overflow-hidden">
                                                    {thumbnailPreview ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
                                                            {!isNewThumbnail && (
                                                                <div className="absolute bottom-2 left-2 bg-black/70 text-xs text-white px-2 py-1 rounded">
                                                                    Current thumbnail
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <Image className="w-10 h-10 text-amber-500/50 mb-2" />
                                                            <p className="text-sm text-amber-300/70">Click to upload thumbnail</p>
                                                            <p className="text-xs text-amber-300/40 mt-1">PNG, JPG, WebP</p>
                                                        </div>
                                                    )}
                                                    <input
                                                        id="thumbnail"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleThumbnailChange}
                                                    />
                                                </label>
                                            </div>
                                            <InputError message={errors.thumbnail} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Options */}
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-amber-400" />
                                            <span className="text-lg font-semibold text-amber-300">Advanced Options</span>
                                        </div>
                                        {showAdvanced ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5 text-amber-400" />}
                                    </button>

                                    {showAdvanced && (
                                        <div className="p-6 pt-0 space-y-6 border-t border-white/5">
                                            {/* Metadata Row */}
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                {/* Release Year */}
                                                <div>
                                                    <InputLabel htmlFor="release_year" value="Release Year" className="text-amber-200" />
                                                    <select
                                                        id="release_year"
                                                        value={data.release_year}
                                                        onChange={(e) => setData('release_year', parseInt(e.target.value))}
                                                        className="mt-1 w-full bg-slate-800/50 border border-white/10 rounded-xl text-white p-3 focus:border-amber-500 focus:ring-amber-500"
                                                    >
                                                        {years.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Content Rating */}
                                                <div>
                                                    <InputLabel htmlFor="content_rating" value="Content Rating" className="text-amber-200" />
                                                    <select
                                                        id="content_rating"
                                                        value={data.content_rating}
                                                        onChange={(e) => setData('content_rating', e.target.value)}
                                                        className="mt-1 w-full bg-slate-800/50 border border-white/10 rounded-xl text-white p-3 focus:border-amber-500 focus:ring-amber-500"
                                                    >
                                                        <option value="">Select rating</option>
                                                        {contentRatings.map(rating => (
                                                            <option key={rating} value={rating}>{rating}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Language */}
                                                <div>
                                                    <InputLabel htmlFor="language" value="Language" className="text-amber-200" />
                                                    <select
                                                        id="language"
                                                        value={data.language}
                                                        onChange={(e) => setData('language', e.target.value)}
                                                        className="mt-1 w-full bg-slate-800/50 border border-white/10 rounded-xl text-white p-3 focus:border-amber-500 focus:ring-amber-500"
                                                    >
                                                        {languages.map(lang => (
                                                            <option key={lang} value={lang}>{lang}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Cast & Crew */}
                                            <div>
                                                <InputLabel value="Cast & Crew" className="text-amber-200 mb-2" />
                                                <div className="space-y-3">
                                                    {castCrewList.map((person, index) => (
                                                        <div key={index} className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={person.name}
                                                                onChange={(e) => updateCastCrew(index, 'name', e.target.value)}
                                                                placeholder="Name"
                                                                className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:ring-amber-500"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={person.role}
                                                                onChange={(e) => updateCastCrew(index, 'role', e.target.value)}
                                                                placeholder="Role (e.g., Director, Actor)"
                                                                className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:ring-amber-500"
                                                            />
                                                            {castCrewList.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCastCrew(index)}
                                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={addCastCrew}
                                                        className="w-full py-2 border border-dashed border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 transition flex items-center justify-center gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add Person
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div>
                                                <InputLabel value="Tags" className="text-amber-200 mb-2" />
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {tagsList.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm text-amber-300"
                                                        >
                                                            #{tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(tag)}
                                                                className="ml-1 text-amber-400 hover:text-amber-200"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleTagKeyDown}
                                                        placeholder="Add tags (press Enter)"
                                                        className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:ring-amber-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addTag}
                                                        className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Publishing Options */}
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-amber-300 mb-5 flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        Publishing
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Category */}
                                        <div>
                                            <InputLabel htmlFor="category" value="Category" className="text-amber-200" />
                                            <select
                                                id="category"
                                                value={data.category_id}
                                                onChange={handleCategoryChange}
                                                className="mt-1 w-full bg-slate-800/50 border border-white/10 rounded-xl text-white p-3 focus:border-amber-500 focus:ring-amber-500"
                                            >
                                                <option value="">Select category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.icon && `${cat.icon} `}{cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category} className="mt-2" />
                                        </div>

                                        {/* Visibility */}
                                        <div>
                                            <InputLabel htmlFor="visibility" value="Visibility" className="text-amber-200" />
                                            <div className="mt-2 space-y-2">
                                                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${data.visibility === 'private' ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800/30 border border-white/10 hover:bg-slate-800/50'}`}>
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        value="private"
                                                        checked={data.visibility === 'private'}
                                                        onChange={(e) => setData('visibility', e.target.value)}
                                                        className="text-amber-500 focus:ring-amber-500"
                                                    />
                                                    <Lock className="w-4 h-4 text-amber-400" />
                                                    <div>
                                                        <div className="text-white font-medium text-sm">Private</div>
                                                        <div className="text-amber-300/60 text-xs">Only you can view</div>
                                                    </div>
                                                </label>

                                                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${data.visibility === 'unlisted' ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800/30 border border-white/10 hover:bg-slate-800/50'}`}>
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        value="unlisted"
                                                        checked={data.visibility === 'unlisted'}
                                                        onChange={(e) => setData('visibility', e.target.value)}
                                                        className="text-amber-500 focus:ring-amber-500"
                                                    />
                                                    <EyeOff className="w-4 h-4 text-amber-400" />
                                                    <div>
                                                        <div className="text-white font-medium text-sm">Unlisted</div>
                                                        <div className="text-amber-300/60 text-xs">Anyone with link</div>
                                                    </div>
                                                </label>

                                                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${data.visibility === 'public' ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800/30 border border-white/10 hover:bg-slate-800/50'}`}>
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        value="public"
                                                        checked={data.visibility === 'public'}
                                                        onChange={(e) => setData('visibility', e.target.value)}
                                                        className="text-amber-500 focus:ring-amber-500"
                                                    />
                                                    <Globe className="w-4 h-4 text-amber-400" />
                                                    <div>
                                                        <div className="text-white font-medium text-sm">Public</div>
                                                        <div className="text-amber-300/60 text-xs">Everyone can discover</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Premiere Toggle */}
                                        <div className="pt-4 border-t border-white/10">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_premiere_public}
                                                    onChange={(e) => setData('is_premiere_public', e.target.checked)}
                                                    className="mt-1 rounded text-amber-500 focus:ring-amber-500 bg-slate-800"
                                                />
                                                <div>
                                                    <div className="text-white font-medium">Publish to Premiere</div>
                                                    <div className="text-amber-300/60 text-sm">Feature your project in the discovery section</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Stats */}
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-amber-300">Project Stats</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-amber-300/60">Views</div>
                                            <div className="text-white font-semibold">{project.views_count || 0}</div>
                                        </div>
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-amber-300/60">Likes</div>
                                            <div className="text-white font-semibold">{project.likes_count || 0}</div>
                                        </div>
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-amber-300/60">Status</div>
                                            <div className={`font-semibold ${project.moderation_status === 'approved' ? 'text-emerald-400' : project.moderation_status === 'pending' ? 'text-amber-400' : 'text-red-400'}`}>
                                                {project.moderation_status || 'Pending'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-amber-300/60">Created</div>
                                            <div className="text-white font-semibold text-xs">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Progress */}
                                {progress && (
                                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-amber-300 text-sm">Uploading...</span>
                                            <span className="text-amber-400 font-semibold">{progress.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <PrimaryButton
                                    type="submit"
                                    className="w-full justify-center py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/25"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </PrimaryButton>

                                {/* Danger Zone */}
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <h4 className="text-red-400 font-semibold mb-2">Danger Zone</h4>
                                    <p className="text-red-300/70 text-sm mb-3">Once deleted, this project cannot be recovered.</p>
                                    <Link
                                        href={route('projects.destroy', project.id)}
                                        method="delete"
                                        as="button"
                                        className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
                                        onClick={(e) => {
                                            if (!confirm('Are you sure you want to delete this project?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Delete Project
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
