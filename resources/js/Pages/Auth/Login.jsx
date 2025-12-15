import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-slate-400 text-sm">Sign in to continue your creative journey</p>
            </div>

            {status && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="font-medium text-sm text-emerald-400 text-center">{status}</p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
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
                            isFocused={true}
                            placeholder="you@example.com"
                            onChange={handleOnChange}
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
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={handleOnChange}
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox name="remember" value={data.remember} onChange={handleOnChange} />
                        <span className="ml-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
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
                                Signing in...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="h-5 w-5" />
                                Sign In
                            </>
                        )}
                    </span>
                    {/* Button shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-900/70 text-slate-500">New to SineAI?</span>
                    </div>
                </div>

                <Link
                    href={route('register')}
                    className="block w-full text-center py-3 px-6 border border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 font-medium rounded-xl transition-all duration-300 hover:bg-amber-500/5"
                >
                    Create an Account
                </Link>
            </form>
        </GuestLayout>
    );
}
