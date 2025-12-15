import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/Contexts/ThemeContext';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });
    
    const { isDark } = useTheme();
    const { t } = useLanguage();

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
            <Head title={t('auth.login')} />

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to continue your creative journey</p>
            </div>

            {status && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="font-medium text-sm text-emerald-400 text-center">{status}</p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value={t('auth.email')} className={`font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className={`block w-full pl-10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all ${
                                isDark 
                                    ? 'bg-slate-950/50 border-white/10 text-white' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                            autoComplete="username"
                            isFocused={true}
                            placeholder="you@example.com"
                            onChange={handleOnChange}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('auth.password')} className={`font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className={`block w-full pl-10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all ${
                                isDark 
                                    ? 'bg-slate-950/50 border-white/10 text-white' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
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
                        <span className={`ml-2 text-sm transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'}`}>
                            {t('auth.remember_me')}
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className={`text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-amber-400' : 'text-slate-500 hover:text-amber-600'}`}
                        >
                            {t('auth.forgot_password')}
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
                                {t('auth.login')}
                            </>
                        )}
                    </span>
                    {/* Button shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className={`px-4 ${isDark ? 'bg-slate-900/70 text-slate-500' : 'bg-white/70 text-slate-400'}`}>{t('auth.new_to_sineai')}</span>
                    </div>
                </div>

                <Link
                    href={route('register')}
                    className={`block w-full text-center py-3 px-6 border font-medium rounded-xl transition-all duration-300 ${
                        isDark 
                            ? 'border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 hover:bg-amber-500/5' 
                            : 'border-slate-200 hover:border-amber-500/30 text-slate-600 hover:text-amber-600 hover:bg-amber-500/5'
                    }`}
                >
                    {t('auth.create_account')}
                </Link>
            </form>
        </GuestLayout>
    );
}
