import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    HardDrive, Upload, Trash2, File, Video, Image, FileText,
    Music, MoreVertical, FolderOpen, Search, Grid, List,
    Download, Edit3, X, Check
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, quota, files, stats }) {
    const [viewMode, setViewMode] = useState('grid');
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [renamingId, setRenamingId] = useState(null);
    const [newName, setNewName] = useState('');
    const fileInputRef = useRef(null);

    const { post, processing } = useForm();

    const getTypeIcon = (type) => {
        const icons = {
            video: <Video className="w-5 h-5" />,
            image: <Image className="w-5 h-5" />,
            document: <FileText className="w-5 h-5" />,
            audio: <Music className="w-5 h-5" />,
            other: <File className="w-5 h-5" />,
        };
        return icons[type] || icons.other;
    };

    const getTypeColor = (type) => {
        const colors = {
            video: 'text-emerald-400 bg-emerald-500/10',
            image: 'text-purple-400 bg-purple-500/10',
            document: 'text-blue-400 bg-blue-500/10',
            audio: 'text-amber-400 bg-amber-500/10',
            other: 'text-slate-400 bg-slate-500/10',
        };
        return colors[type] || colors.other;
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size against remaining quota
        if (file.size > quota.remaining) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Storage',
                text: `This file is ${formatBytes(file.size)} but you only have ${quota.formatted_remaining} remaining.`,
                background: '#1e293b',
                color: '#fef3c7',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(route('storage.upload'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });

            if (response.ok) {
                router.reload({ only: ['files', 'quota', 'stats'] });
                Swal.fire({
                    icon: 'success',
                    title: 'Uploaded!',
                    timer: 2000,
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                });
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: error.message,
                background: '#1e293b',
                color: '#fef3c7',
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = (file) => {
        Swal.fire({
            title: 'Delete File?',
            text: `"${file.name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Delete',
            background: '#1e293b',
            color: '#fef3c7',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('storage.destroy', file.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleRename = (file) => {
        setRenamingId(file.id);
        setNewName(file.name);
    };

    const submitRename = (file) => {
        if (newName.trim() && newName !== file.name) {
            router.patch(route('storage.rename', file.id), { name: newName }, {
                preserveScroll: true,
                onSuccess: () => {
                    setRenamingId(null);
                    setNewName('');
                },
            });
        } else {
            setRenamingId(null);
        }
    };

    const formatBytes = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(2)} ${units[i]}`;
    };

    // Flatten files for display
    const allFiles = Object.values(files).flat();
    
    // Filter files
    const filteredFiles = allFiles.filter(file => {
        if (filterType !== 'all' && file.type !== filterType) return false;
        if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-amber-100 leading-tight flex items-center gap-2">
                        <HardDrive className="w-6 h-6 text-amber-400" />
                        My Storage
                    </h2>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500 transition cursor-pointer">
                        <Upload className="w-5 h-5" />
                        Upload File
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleUpload}
                            className="hidden"
                            accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.txt"
                        />
                    </label>
                </div>
            }
        >
            <Head title="My Storage" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Storage Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        {/* Quota Card */}
                        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-amber-100 mb-4">Storage Usage</h3>
                            
                            <div className="flex items-end gap-4 mb-4">
                                <div className="text-4xl font-bold text-white">{quota.formatted_used}</div>
                                <div className="text-slate-400 pb-1">of {quota.formatted_total}</div>
                            </div>

                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        quota.percentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        quota.percentage > 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                        'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                    }`}
                                    style={{ width: `${quota.percentage}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{quota.percentage.toFixed(1)}% used</span>
                                <span className="text-emerald-400">{quota.formatted_remaining} remaining</span>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Video className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stats.videos}</div>
                                    <div className="text-sm text-slate-400">Videos</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Image className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stats.images}</div>
                                    <div className="text-sm text-slate-400">Images</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stats.documents}</div>
                                    <div className="text-sm text-slate-400">Documents</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-500/10">
                                    <FolderOpen className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stats.total_files}</div>
                                    <div className="text-sm text-slate-400">Total Files</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                                {[
                                    { value: 'all', label: 'All Files' },
                                    { value: 'video', label: 'Videos' },
                                    { value: 'image', label: 'Images' },
                                    { value: 'document', label: 'Documents' },
                                    { value: 'audio', label: 'Audio' },
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setFilterType(filter.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                                            filterType === filter.value
                                                ? 'bg-amber-500 text-slate-900'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search files..."
                                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500 focus:ring-amber-500"
                                    />
                                </div>

                                <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Files Display */}
                    {uploading && (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
                                <span className="text-amber-300">Uploading...</span>
                            </div>
                        </div>
                    )}

                    {filteredFiles.length === 0 ? (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                            <HardDrive className="w-16 h-16 text-amber-500/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-amber-100 mb-2">
                                {searchQuery || filterType !== 'all' ? 'No Files Found' : 'No Files Yet'}
                            </h3>
                            <p className="text-amber-300/60 mb-6">
                                {searchQuery || filterType !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Upload your first file to get started.'}
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition"
                                >
                                    {/* Preview */}
                                    <div className="aspect-square bg-slate-800 relative">
                                        {file.type === 'image' ? (
                                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                        ) : file.type === 'video' ? (
                                            <video src={file.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${getTypeColor(file.type)}`}>
                                                {getTypeIcon(file.type)}
                                            </div>
                                        )}

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-white" />
                                            </a>
                                            <button
                                                onClick={() => handleRename(file)}
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                                                title="Rename"
                                            >
                                                <Edit3 className="w-4 h-4 text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file)}
                                                className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        {renamingId === file.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    className="flex-1 bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') submitRename(file);
                                                        if (e.key === 'Escape') setRenamingId(null);
                                                    }}
                                                />
                                                <button onClick={() => submitRename(file)} className="p-1 text-emerald-400">
                                                    <Check className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => setRenamingId(null)} className="p-1 text-slate-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-white truncate" title={file.name}>{file.name}</p>
                                                <p className="text-xs text-slate-500">{file.formatted_size}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                            <div className="divide-y divide-white/5">
                                {filteredFiles.map((file) => (
                                    <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition">
                                        <div className={`p-3 rounded-lg ${getTypeColor(file.type)}`}>
                                            {getTypeIcon(file.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            {renamingId === file.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="bg-slate-800 border border-white/10 rounded px-3 py-1 text-white"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') submitRename(file);
                                                            if (e.key === 'Escape') setRenamingId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => submitRename(file)} className="p-1 text-emerald-400">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setRenamingId(null)} className="p-1 text-slate-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-white font-medium truncate">{file.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {file.formatted_size} • {new Date(file.created_at).toLocaleDateString()}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleRename(file)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
