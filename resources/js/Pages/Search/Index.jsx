import React from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import CinemaCard from '@/Components/Premiere/CinemaCard';
import { Link } from '@inertiajs/react';

export default function SearchIndex({ results = null, query = '' }) {
    const items = results?.data ?? [];

    return (
        <CinemaLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold mb-4">Search results for: "{query}"</h1>

                {items.length === 0 ? (
                    <div className="text-gray-400">No results found.</div>
                ) : (
                    <div>
                        <div className="flex flex-wrap gap-4">
                            {items.map((p) => (
                                <CinemaCard key={p.id} project={p} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {results?.links && (
                            <div className="mt-6">
                                <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                                    {results.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || ''}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'} ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`}
                                            as="button"
                                            disabled={!link.url}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CinemaLayout>
    );
}
