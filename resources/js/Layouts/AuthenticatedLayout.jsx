import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const { auth } = usePage().props;
  const currentUser = user ?? auth?.user ?? {};

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
                      {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/images/logo.png"
                  alt="SineAI"
                  className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
                              <span className="text-xl font-bold tracking-tight text-white">
                                  SineAI <span className="text-amber-500">Hub</span>
                              </span>
              </Link>
            </div>

                      {/* Center navigation */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="hidden sm:flex space-x-6">
                                <Link
                                    href={route('dashboard')}
                                    className={
                                        route().current('dashboard')
                                            ? 'text-amber-500 border-b-2 border-amber-500 font-bold focus:outline-none focus:border-amber-700 transition duration-150 ease-in-out'
                                            : 'text-slate-300 hover:text-white hover:border-amber-500/50 border-b-2 border-transparent transition duration-150 ease-in-out'
                                    }
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href={route('projects.index')}
                                    className={
                                        route().current('projects.*')
                                            ? 'text-amber-500 border-b-2 border-amber-500 font-bold focus:outline-none focus:border-amber-700 transition duration-150 ease-in-out'
                                            : 'text-slate-300 hover:text-white hover:border-amber-500/50 border-b-2 border-transparent transition duration-150 ease-in-out'
                                    }
                                >
                                    Projects
                                </Link>

                                <Link
                                    href={route('chat')}
                                    className={
                                        route().current('chat')
                                            ? 'text-amber-500 border-b-2 border-amber-500 font-bold focus:outline-none focus:border-amber-700 transition duration-150 ease-in-out'
                                            : 'text-slate-300 hover:text-white hover:border-amber-500/50 border-b-2 border-transparent transition duration-150 ease-in-out'
                                    }
                                >
                                    Chat
                                </Link>

                                <Link
                                    href={route('ai.assistant')}
                                    className={
                                        route().current('ai.assistant')
                                            ? 'text-amber-500 border-b-2 border-amber-500 font-bold focus:outline-none focus:border-amber-700 transition duration-150 ease-in-out'
                                            : 'text-slate-300 hover:text-white hover:border-amber-500/50 border-b-2 border-transparent transition duration-150 ease-in-out'
                                    }
                                >
                                    Spark
                                </Link>
                              <Link
                                  href={route('scriptwriter.index')}
                                  className={
                                      route().current('scriptwriter.index')
                                          ? 'text-amber-500 border-b-2 border-amber-500 font-bold focus:outline-none focus:border-amber-700 transition duration-150 ease-in-out'
                                          : 'text-slate-300 hover:text-white hover:border-amber-500/50 border-b-2 border-transparent transition duration-150 ease-in-out'
                                  }
                              >
                                  Scriptwriter
                              </Link>
                            </div>
                        </div>

                      {/* Right side - user dropdown */}
                      <div className="hidden sm:flex sm:items-center sm:ml-6">
                          <div className="ml-3 relative">
                              <Dropdown>
                                  <Dropdown.Trigger>
                                      <button type="button" className="text-slate-300 hover:text-amber-500 inline-flex items-center gap-2">
                                          <span>{currentUser?.name ?? 'Guest'}</span>
                                          <svg className="h-4 w-4 text-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                          </svg>
                                      </button>
                                  </Dropdown.Trigger>

                                  <Dropdown.Content contentClasses={'py-1 bg-slate-900 text-white border border-white/10'} align="right">
                                      <Dropdown.Link href={route('profile.edit')} className={'text-white'}>Profile</Dropdown.Link>
                                      <Dropdown.Link href={route('logout')} method="post" as="button" className={'text-white'}>Log Out</Dropdown.Link>
                                  </Dropdown.Content>
                              </Dropdown>
                          </div>
                      </div>

                      {/* Mobile menu button */}
                      <div className="-mr-2 flex items-center sm:hidden">
                          <button
                              onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none transition duration-150 ease-in-out"
                              aria-label="Toggle navigation"
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

              {/* Mobile navigation */}
              <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-slate-900/90 backdrop-blur-md'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            href={route('dashboard')}
                            className={
                                route().current('dashboard')
                                    ? 'block px-4 py-2 text-base font-medium text-amber-500 bg-slate-800 transition duration-150 ease-in-out'
                                    : 'block px-4 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition duration-150 ease-in-out'
                            }
                        >
                            Dashboard
                        </Link>

                        <Link
                            href={route('projects.index')}
                            className={
                                route().current('projects.*')
                                    ? 'block px-4 py-2 text-base font-medium text-amber-500 bg-slate-800 transition duration-150 ease-in-out'
                                    : 'block px-4 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition duration-150 ease-in-out'
                            }
                        >
                            Projects
                        </Link>

                        <Link
                            href={route('chat')}
                            className={
                                route().current('chat')
                                    ? 'block px-4 py-2 text-base font-medium text-amber-500 bg-slate-800 transition duration-150 ease-in-out'
                                    : 'block px-4 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition duration-150 ease-in-out'
                            }
                        >
                            Chat
                        </Link>

                        <Link
                            href={route('ai.assistant')}
                            className={
                                route().current('ai.assistant')
                                    ? 'block px-4 py-2 text-base font-medium text-amber-500 bg-slate-800 transition duration-150 ease-in-out'
                                    : 'block px-4 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition duration-150 ease-in-out'
                            }
                        >
                            Spark
                        </Link>
                    </div>

                  <div className="pt-4 pb-1 border-t border-white/10">
                      <div className="px-4">
                          <div className="font-medium text-base text-white">{currentUser?.name ?? 'Guest'}</div>
                          <div className="font-medium text-sm text-slate-400">{currentUser?.email ?? ''}</div>
                      </div>

                      <div className="mt-3 space-y-1 px-2">
                          <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-slate-300 hover:text-white">Profile</Link>
                          <Link href={route('logout')} method="post" as="button" className="block px-4 py-2 text-sm text-slate-300 hover:text-white">Log Out</Link>
                      </div>
                  </div>
              </div>
          </nav>

          {header && (
              <header className="bg-transparent pt-6">
                  <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">{header}</div>
              </header>
          )}

          <main className="pt-6">{children}</main>
        </div>
    );
}
