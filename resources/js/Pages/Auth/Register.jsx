import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserIcon, EnvelopeIcon, LockClosedIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Join SineAI Hub</h1>
                <p className="text-slate-400 text-sm">Start your filmmaking journey today</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-slate-300 font-medium mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-slate-500" />
                        </div>
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="block w-full pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            autoComplete="name"
                            isFocused={true}
                            placeholder="John Doe"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-300 font-medium mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-slate-500" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            autoComplete="username"
                            placeholder="you@example.com"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300 font-medium mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-slate-500" />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-300 font-medium mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-slate-500" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pl-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full relative group bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-900/30 hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {processing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </>
                        ) : (
                            <>
                                <RocketLaunchIcon className="h-5 w-5" />
                                Create Account
                            </>
                        )}
                    </span>
                    {/* Button shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <p className="text-xs text-slate-500 text-center">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-amber-400 hover:text-amber-300">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-amber-400 hover:text-amber-300">Privacy Policy</a>
                </p>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-900/70 text-slate-500">Already a member?</span>
                    </div>
                </div>

                <Link
                    href={route('login')}
                    className="block w-full text-center py-3 px-6 border border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 font-medium rounded-xl transition-all duration-300 hover:bg-amber-500/5"
                >
                    Sign In Instead
                </Link>
            </form>
        </GuestLayout>
    );
}
