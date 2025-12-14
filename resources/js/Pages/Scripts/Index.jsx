import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Trash2, Edit3, Clock, ChevronRight, Sparkles, Search } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const swalTheme = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#475569',
    iconColor: '#f59e0b',
};

export default function ScriptsIndex({ auth, scripts }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    const scriptsList = scripts?.data || scripts || [];
    const pagination = scripts?.links || null;

    const filteredScripts = scriptsList.filter(script => 
        (script.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (script) => {
        Swal.fire({
            ...swalTheme,
            title: 'Delete Script?',
            html: `<p class="text-slate-400">This will permanently delete "<span class="text-white font-medium">${script.title || 'Untitled Script'}</span>".</p><p class="text-red-400 text-sm mt-2">This action cannot be undone.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('scriptwriter.destroy', script.id), {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Deleted!',
                            text: 'Your script has been removed.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPreviewText = (content) => {
        if (!content) return 'Empty script...';
        try {
            const blocks = typeof content === 'string' ? JSON.parse(content) : content;
            if (Array.isArray(blocks) && blocks.length > 0) {
                const textBlocks = blocks.slice(0, 3).map(b => b.content).filter(Boolean);
                return textBlocks.join(' ').substring(0, 150) + (textBlocks.join(' ').length > 150 ? '...' : '');
            }
        } catch {
            return 'Empty script...';
        }
        return 'Empty script...';
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">My Scripts</h2>}
        >
            <Head title="My Scripts" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                My Scripts
                            </h1>
                            <p className="text-slate-400 mt-1">Manage and edit your screenplays</p>
                        </div>
                        
                        <Link 
                            href={route('scriptwriter.index')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            New Script
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search scripts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Scripts Grid */}
                    {filteredScripts.length === 0 ? (
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                                <FileText className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No scripts yet</h3>
                            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                                Start writing your first screenplay with our powerful scriptwriter tool.
                            </p>
                            <Link 
                                href={route('scriptwriter.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                            >
                                <Sparkles className="w-5 h-5" />
                                Create Your First Script
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredScripts.map((script) => (
                                <div 
                                    key={script.id}
                                    className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(script)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete script"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <Link href={route('scriptwriter.show', script.id)} className="block group/link">
                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover/link:text-amber-500 transition-colors truncate">
                                            {script.title || 'Untitled Script'}
                                        </h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                                            {getPreviewText(script.content)}
                                        </p>
                                    </Link>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDate(script.updated_at || script.created_at)}
                                        </div>
                                        <Link 
                                            href={route('scriptwriter.show', script.id)}
                                            className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            Edit
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="inline-flex -space-x-px rounded-xl overflow-hidden border border-slate-700/50" aria-label="Pagination">
                                {pagination.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || ''}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                                        as="button"
                                        disabled={!link.url}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
