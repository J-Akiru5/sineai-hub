import React from 'react';
import { useForm } from '@inertiajs/react';

export default function SearchBar({ initial = '' }) {
    const { data, setData, get, processing } = useForm({ query: initial });

    const submit = (e) => {
        e.preventDefault();
        // perform GET to search route with query
        get(route('search.index'));
    };

    return (
        <form onSubmit={submit} className="flex items-center">
            <input
                type="search"
                name="query"
                value={data.query}
                onChange={(e) => setData('query', e.target.value)}
                placeholder="Search Premiere..."
                className="px-3 py-1 rounded bg-black/60 placeholder-gray-300 text-white border border-white/6"
            />
            <button type="submit" disabled={processing} className="ml-2 p-2 rounded bg-amber-500 text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
            </button>
        </form>
    );
}
