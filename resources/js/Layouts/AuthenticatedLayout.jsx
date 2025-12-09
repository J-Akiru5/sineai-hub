import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeSwitcher from '@/Components/ThemeSwitcher';

export default function Authenticated(props) {
    // Accept either `auth` (with `auth.user`) or a direct `user` prop.
    // Some pages pass `auth={auth}` (Inertia default) while others mistakenly pass `user={auth.user}`.
    // Normalize to a single `user` object to avoid TypeErrors when `auth` is undefined.
    const { header, children } = props;
    const user = props.auth?.user ?? props.user ?? {};

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Background blobs for subtle depth */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-72 -left-72 w-[30rem] h-[30rem] bg-red-900/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-60 -right-56 w-[28rem] h-[28rem] bg-red-900/20 rounded-full blur-3xl opacity-25" />
            </div>

            <nav className="fixed inset-x-0 top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="inline-flex items-center gap-3 no-underline">
                                <img src="/images/logo.png" alt="SineAI Hub" className="h-10 w-auto rounded-sm shadow-sm" />
                                <div className="hidden sm:block leading-tight">
                                    <div className="text-base font-semibold tracking-tight text-amber-100">SineAI</div>
                                    <div className="text-xs font-medium tracking-tight text-amber-300">Hub</div>
                                </div>
                            </Link>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            <div className="hidden sm:flex space-x-8">
                                <NavLink className="text-white" href={route('dashboard')} active={route().current('dashboard')}>Dashboard</NavLink>
                                <NavLink className="text-white" href={route('projects.index')} active={route().current('projects.index')}>Projects</NavLink>
                                <NavLink className="text-white" href={route('chat')} active={route().current('chat')}>Chat</NavLink>
                                <NavLink className="text-white" href={route('ai.assistant')} active={route().current('ai.assistant')}>Spark</NavLink>
                                <NavLink className="text-white" href={route('projects.create')} active={route().current('projects.create')}>Upload</NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-slate-800/20 hover:bg-white/5 focus:outline-none transition duration-150"
                                            >
                                                <span className="mr-2">{user.name ?? 'User'}</span>
                                                <svg
                                                    className="ml-0 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/5 focus:outline-none transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-slate-900/80 backdrop-blur-md'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-white/10">
                        <div className="px-4">
                            <div className="font-medium text-base text-white">{user.name ?? 'User'}</div>
                            <div className="font-medium text-sm text-slate-400">{user.email ?? ''}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-transparent">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
