import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

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

            {status && <div className="mb-4 font-medium text-sm text-emerald-400">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-300 font-medium" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-slate-950/50 border-white/10 text-white rounded-lg"
                        autoComplete="username"
                        isFocused={true}
                        onChange={handleOnChange}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300 font-medium" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-slate-950/50 border-white/10 text-white rounded-lg"
                        autoComplete="current-password"
                        onChange={handleOnChange}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox name="remember" value={data.remember} onChange={handleOnChange} />
                        <span className="ml-2 text-sm text-slate-300">Remember me</span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-slate-400 hover:text-amber-500 rounded-md focus:outline-none"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="ml-4 w-full sm:w-auto justify-center bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-amber-900/20 transition-all disabled:opacity-50"
                    >
                        Log in
                    </button>
                </div>
                {/* Don't have an account link */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link href={route('register')} className="text-amber-400 font-semibold hover:text-amber-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
