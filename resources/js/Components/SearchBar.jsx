import React from 'react';
import { useForm } from '@inertiajs/react';

export default function SearchBar({ initial = '' }) {
    const { data, setData, get, processing } = useForm({ query: initial });

    const submit = (e) => {
        e.preventDefault();
        get(route('search.index'));
    };

    return (
        <form onSubmit={submit} className="flex items-center w-full" role="search">
            <input
                type="search"
                name="query"
                value={data.query}
                onChange={(e) => setData('query', e.target.value)}
                placeholder="Search Premiere..."
                className="w-full px-4 py-2 rounded-full bg-white/10 backdrop-blur placeholder-gray-200 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition"
            />
            <button type="submit" disabled={processing} className="ml-2 p-2 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
            </button>
        </form>
    );
}
