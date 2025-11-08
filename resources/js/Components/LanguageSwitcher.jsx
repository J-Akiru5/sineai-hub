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
        <div>
            <select value={current} onChange={handleChange} className="text-sm rounded border px-2 py-1 bg-white">
                <option value="en">EN</option>
                <option value="tl">TL</option>
            </select>
        </div>
    );
}
