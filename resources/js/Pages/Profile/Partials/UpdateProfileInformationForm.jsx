import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import UserAvatar from '@/Components/UserAvatar';
import { PhotoIcon, GlobeAltIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className }) {
    const user = usePage().props.auth.user;

    const [preview, setPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [activeSection, setActiveSection] = useState('basic');

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        username: user.username || '',
        pen_name: user.pen_name || '',
        studio_name: user.studio_name || '',
        location: user.location || '',
        contact_number: user.contact_number || '',
        bio: user.bio || '',
        headline: user.headline || '',
        website: user.website || '',
        social_twitter: user.social_links?.twitter || '',
        social_youtube: user.social_links?.youtube || '',
        social_instagram: user.social_links?.instagram || '',
        social_tiktok: user.social_links?.tiktok || '',
        avatar: null,
        banner: null,
        _method: 'patch',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'));
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        };
    }, [preview, bannerPreview]);

    const sections = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'creator', label: 'Creator Profile' },
        { id: 'social', label: 'Social Links' },
    ];

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-amber-100">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Update your account's profile information and public profile.
                </p>
            </header>

            {/* Section tabs */}
            <div className="flex gap-1 mt-6 p-1 bg-slate-800/50 rounded-lg w-fit">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeSection === section.id
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'text-gray-400 hover:text-amber-100'
                        }`}
                    >
                        {section.label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Basic Info Section */}
                {activeSection === 'basic' && (
                    <div className="space-y-6">
                        {/* Avatar & Banner */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-6">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <InputLabel value="Avatar" className="mb-2" />
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-700">
                                            {preview || user.avatar_url ? (
                                                <img 
                                                    src={preview || user.avatar_url} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-2xl font-bold text-white">
                                                    {(user.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                                            <PhotoIcon className="w-6 h-6 text-white" />
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    setData('avatar', file);
                                                    if (file) setPreview(URL.createObjectURL(file));
                                                }} 
                                            />
                                        </label>
                                    </div>
                                    <InputError className="mt-2" message={errors.avatar} />
                                </div>

                                {/* Banner */}
                                <div className="flex-1">
                                    <InputLabel value="Profile Banner" className="mb-2" />
                                    <div className="relative group">
                                        <div className="h-24 rounded-xl overflow-hidden bg-slate-700">
                                            {bannerPreview || user.banner_url ? (
                                                <img 
                                                    src={bannerPreview || user.banner_url} 
                                                    alt="Banner" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-700">
                                                    <span className="text-gray-500 text-sm">No banner</span>
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                                            <PhotoIcon className="w-6 h-6 text-white" />
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    setData('banner', file);
                                                    if (file) setBannerPreview(URL.createObjectURL(file));
                                                }} 
                                            />
                                        </label>
                                    </div>
                                    <InputError className="mt-2" message={errors.banner} />
                                </div>
                            </div>
                        </div>
                        {/* Name & Username */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="username" value="Username" />
                                <div className="mt-1 flex">
                                    <span className="inline-flex items-center px-3 bg-slate-700/50 border border-r-0 border-white/10 rounded-l-md text-gray-400 text-sm">
                                        @
                                    </span>
                                    <TextInput
                                        id="username"
                                        className="block w-full rounded-l-none"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="your_username"
                                    />
                                </div>
                                <InputError className="mt-2" message={errors.username} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-sm text-amber-100">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="underline hover:text-amber-400"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm text-green-400">
                                        A new verification link has been sent.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Professional info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="pen_name" value="Pen Name / Screen Name" />
                                <TextInput
                                    id="pen_name"
                                    className="mt-1 block w-full"
                                    value={data.pen_name}
                                    onChange={(e) => setData('pen_name', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.pen_name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="studio_name" value="Studio Name" />
                                <TextInput
                                    id="studio_name"
                                    className="mt-1 block w-full"
                                    value={data.studio_name}
                                    onChange={(e) => setData('studio_name', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.studio_name} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="location" value="Location" />
                                <TextInput
                                    id="location"
                                    className="mt-1 block w-full"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="City, Country"
                                />
                                <InputError className="mt-2" message={errors.location} />
                            </div>

                            <div>
                                <InputLabel htmlFor="contact_number" value="Contact Number" />
                                <TextInput
                                    id="contact_number"
                                    className="mt-1 block w-full"
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.contact_number} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Creator Profile Section */}
                {activeSection === 'creator' && (
                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="headline" value="Headline" />
                            <TextInput
                                id="headline"
                                className="mt-1 block w-full"
                                value={data.headline}
                                onChange={(e) => setData('headline', e.target.value)}
                                placeholder="e.g. Filmmaker | Storyteller | Dreamer"
                                maxLength={100}
                            />
                            <p className="mt-1 text-xs text-gray-500">{data.headline.length}/100 characters</p>
                            <InputError className="mt-2" message={errors.headline} />
                        </div>

                        <div>
                            <InputLabel htmlFor="bio" value="Bio" />
                            <textarea
                                id="bio"
                                className="mt-1 block w-full rounded-md bg-slate-800/50 border border-white/10 text-amber-100 focus:border-amber-500 focus:ring-amber-500"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                rows={5}
                                placeholder="Tell us about yourself, your work, and your creative journey..."
                                maxLength={500}
                            />
                            <p className="mt-1 text-xs text-gray-500">{data.bio.length}/500 characters</p>
                            <InputError className="mt-2" message={errors.bio} />
                        </div>

                        <div>
                            <InputLabel htmlFor="website" value="Website" />
                            <div className="mt-1 flex">
                                <span className="inline-flex items-center px-3 bg-slate-700/50 border border-r-0 border-white/10 rounded-l-md text-gray-400">
                                    <GlobeAltIcon className="w-4 h-4" />
                                </span>
                                <TextInput
                                    id="website"
                                    type="url"
                                    className="block w-full rounded-l-none"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                            <InputError className="mt-2" message={errors.website} />
                        </div>

                        {user.is_verified_creator && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-amber-100 font-medium">Verified Creator</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-400">Your account has been verified as an official creator.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Social Links Section */}
                {activeSection === 'social' && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 mb-4">
                            Add your social media links to display on your public profile.
                        </p>

                        <div>
                            <InputLabel htmlFor="social_twitter" value="X (Twitter)" />
                            <div className="mt-1 flex">
                                <span className="inline-flex items-center px-3 bg-slate-700/50 border border-r-0 border-white/10 rounded-l-md text-gray-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </span>
                                <TextInput
                                    id="social_twitter"
                                    type="url"
                                    className="block w-full rounded-l-none"
                                    value={data.social_twitter}
                                    onChange={(e) => setData('social_twitter', e.target.value)}
                                    placeholder="https://x.com/username"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="social_youtube" value="YouTube" />
                            <div className="mt-1 flex">
                                <span className="inline-flex items-center px-3 bg-slate-700/50 border border-r-0 border-white/10 rounded-l-md text-gray-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </span>
                                <TextInput
                                    id="social_youtube"
                                    type="url"
                                    className="block w-full rounded-l-none"
                                    value={data.social_youtube}
                                    onChange={(e) => setData('social_youtube', e.target.value)}
                                    placeholder="https://youtube.com/@channel"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="social_instagram" value="Instagram" />
                            <div className="mt-1 flex">
                                <span className="inline-flex items-center px-3 bg-slate-700/50 border border-r-0 border-white/10 rounded-l-md text-gray-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                    </svg>
                                </span>
                                <TextInput
                                    id="social_instagram"
                                    type="url"
                                    className="block w-full rounded-l-none"
                                    value={data.social_instagram}
                                    onChange={(e) => setData('social_instagram', e.target.value)}
                                    placeholder="https://instagram.com/username"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="social_tiktok" value="TikTok" />
                            <div className="mt-1 flex">
                                <span className="inline-flex items-center px-3 bg-slate-700/50 border border-r-0 border-white/10 rounded-l-md text-gray-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                    </svg>
                                </span>
                                <TextInput
                                    id="social_tiktok"
                                    type="url"
                                    className="block w-full rounded-l-none"
                                    value={data.social_tiktok}
                                    onChange={(e) => setData('social_tiktok', e.target.value)}
                                    placeholder="https://tiktok.com/@username"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enterFrom="opacity-0"
                        leaveTo="opacity-0"
                        className="transition ease-in-out"
                    >
                        <p className="text-sm text-green-400">Saved successfully!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
