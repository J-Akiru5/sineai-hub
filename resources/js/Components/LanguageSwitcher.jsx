import React from 'react';
import { router, usePage } from '@inertiajs/react';

export default function LanguageSwitcher() {
    const { props } = usePage();
    const current = props.locale ?? 'en';

    const handleChange = (e) => {
        const locale = e.target.value;
        // Use Inertia POST so the app updates without a full page reload
        router.post(route('language'), { locale }, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="inline-flex items-center">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 shadow-sm">
                {/* Globe icon */}
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v20m0-20c2.21 2.21 3.5 5.02 3.5 8s-1.29 5.79-3.5 8M12 2C9.79 4.21 8.5 7.02 8.5 10s1.29 5.79 3.5 8" />
                </svg>

                <div className="relative">
                    <label htmlFor="language-select" className="sr-only">Language</label>
                    <select
                        id="language-select"
                        value={current}
                        onChange={handleChange}
                        className="appearance-none bg-transparent pr-7 pl-1 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
                        title="Select language"
                        aria-label="Select language"
                    >
                        <option value="en">English — EN</option>
                        <option value="tl">Tagalog — TL</option>
                    </select>

                    {/* Chevron */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.12 1L10.53 13.3a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
