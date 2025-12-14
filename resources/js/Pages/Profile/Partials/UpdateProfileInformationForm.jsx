import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import UserAvatar from '@/Components/UserAvatar';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className }) {
    const user = usePage().props.auth.user;

    const [preview, setPreview] = useState(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        pen_name: user.pen_name || '',
        studio_name: user.studio_name || '',
        location: user.location || '',
        contact_number: user.contact_number || '',
        avatar: null,
        _method: 'patch',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'));
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-amber-100">Profile Information</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div>
                        <UserAvatar user={preview ? { avatar_url: preview, name: user.name } : user} size={10} />
                    </div>
                    <div>
                        <InputLabel htmlFor="avatar" value="Avatar" />
                        <input id="avatar" name="avatar" type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            setData('avatar', file);
                            if (file) {
                                const url = URL.createObjectURL(file);
                                setPreview(url);
                            } else {
                                setPreview(null);
                            }
                        }} className="mt-1" />
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>
                </div>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="pen_name" value="Pen Name / Screen Name" />

                    <TextInput
                        id="pen_name"
                        className="mt-1 block w-full"
                        value={data.pen_name}
                        onChange={(e) => setData('pen_name', e.target.value)}
                        autoComplete="off"
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
                        autoComplete="organization"
                    />

                    <InputError className="mt-2" message={errors.studio_name} />
                </div>

                <div>
                    <InputLabel htmlFor="location" value="Location" />

                    <TextInput
                        id="location"
                        className="mt-1 block w-full"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        autoComplete="street-address"
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
                        autoComplete="tel"
                    />

                    <InputError className="mt-2" message={errors.contact_number} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enterFrom="opacity-0"
                        leaveTo="opacity-0"
                        className="transition ease-in-out"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
