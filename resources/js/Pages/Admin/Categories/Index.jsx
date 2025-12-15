import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Tag,
    Plus,
    Edit3,
    Trash2,
    GripVertical,
    Film,
    Check,
    X,
    Save,
    Palette,
    Search,
    RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, categories, filters = {} }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const debounceRef = useRef(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        description: '',
        icon: '🎬',
        color: 'amber',
        is_active: true,
    });

    const colorOptions = [
        { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
        { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
        { name: 'Green', value: 'green', class: 'bg-green-500' },
        { name: 'Red', value: 'red', class: 'bg-red-500' },
        { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
        { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
        { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
        { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    ];

    const iconOptions = ['🎬', '🎥', '📹', '🎞️', '📺', '🎭', '🎪', '🎨', '🎵', '🎸', '💀', '😂', '🚀', '💡', '🌟', '⚡'];

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowCreate(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Category Created',
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                    timer: 2000,
                });
            },
        });
    };

    const handleUpdate = (category) => {
        patch(route('admin.categories.update', category.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                Swal.fire({
                    icon: 'success',
                    title: 'Category Updated',
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                    timer: 2000,
                });
            },
        });
    };

    const handleDelete = (category) => {
        Swal.fire({
            title: 'Delete Category?',
            text: category.projects_count > 0 
                ? `This category has ${category.projects_count} projects. Please reassign them first.`
                : 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Delete',
            background: '#1e293b',
            color: '#fef3c7',
        }).then((result) => {
            if (result.isConfirmed && category.projects_count === 0) {
                router.delete(route('admin.categories.destroy', category.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '🎬',
            color: category.color || 'amber',
            is_active: category.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === dropIndex) return;

        const newOrder = [...categories];
        const [dragged] = newOrder.splice(draggedItem, 1);
        newOrder.splice(dropIndex, 0, dragged);

        // Send new order to server
        fetch(route('admin.categories.reorder'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify({ order: newOrder.map(c => c.id) }),
        });

        setDraggedItem(null);
    };

    const getColorClass = (color) => {
        const colors = {
            amber: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
            blue: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
            green: 'bg-green-500/20 border-green-500/50 text-green-300',
            red: 'bg-red-500/20 border-red-500/50 text-red-300',
            purple: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
            pink: 'bg-pink-500/20 border-pink-500/50 text-pink-300',
            cyan: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
            orange: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
        };
        return colors[color] || colors.amber;
    };

    // Search with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('admin.categories.index'), {
                search: search || undefined,
                status: statusFilter || undefined,
            }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // Immediate filter change
    useEffect(() => {
        router.get(route('admin.categories.index'), {
            search: search || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, replace: true });
    }, [statusFilter]);

    return (
        <AdminLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-amber-100 leading-tight flex items-center gap-2">
                        <Tag className="w-6 h-6 text-amber-400" />
                        Category Management
                    </h2>
                </div>
            }
        >
            <Head title="Categories" />

            {/* Search & Filter Toolbar */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
                            className="pl-10 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={() => router.get(route('admin.categories.index'), {}, { preserveState: true, replace: true })}
                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Create Form */}
                    {showCreate && (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-amber-300 mb-4">Create New Category</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-amber-200 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-amber-500"
                                            placeholder="e.g., Short Film"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-amber-200 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-amber-500"
                                            placeholder="Brief description..."
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-amber-200 mb-2">Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {iconOptions.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setData('icon', icon)}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                                                        data.icon === icon
                                                            ? 'bg-amber-500/30 border-2 border-amber-500'
                                                            : 'bg-slate-800/50 border border-white/10 hover:bg-slate-700/50'
                                                    }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-amber-200 mb-2">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setData('color', color.value)}
                                                    className={`w-10 h-10 rounded-lg ${color.class} transition ${
                                                        data.color === color.value
                                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                                            : 'opacity-60 hover:opacity-100'
                                                    }`}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-amber-500 focus:ring-amber-500 bg-slate-800"
                                        />
                                        <span className="text-amber-200">Active</span>
                                    </label>
                                    <div className="flex-1" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreate(false);
                                            reset();
                                        }}
                                        className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50"
                                    >
                                        Create Category
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories List */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <p className="text-amber-300/70 text-sm">Drag to reorder categories. Order affects display in dropdowns and filters.</p>
                        </div>

                        {categories.length === 0 ? (
                            <div className="p-12 text-center">
                                <Tag className="w-16 h-16 text-amber-500/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-amber-100 mb-2">No Categories Yet</h3>
                                <p className="text-amber-300/60">Create your first category to organize projects.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {categories.map((category, index) => (
                                    <div
                                        key={category.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`group p-4 hover:bg-white/5 transition ${draggedItem === index ? 'opacity-50' : ''}`}
                                    >
                                        {editingId === category.id ? (
                                            /* Edit Mode */
                                            <div className="space-y-4">
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                        placeholder="Description"
                                                        className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:ring-amber-500"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex gap-1">
                                                        {iconOptions.slice(0, 8).map((icon) => (
                                                            <button
                                                                key={icon}
                                                                type="button"
                                                                onClick={() => setData('icon', icon)}
                                                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                                                    data.icon === icon ? 'bg-amber-500/30' : 'bg-slate-800/50'
                                                                }`}
                                                            >
                                                                {icon}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {colorOptions.map((color) => (
                                                            <button
                                                                key={color.value}
                                                                type="button"
                                                                onClick={() => setData('color', color.value)}
                                                                className={`w-6 h-6 rounded ${color.class} ${
                                                                    data.color === color.value ? 'ring-2 ring-white' : 'opacity-50'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.is_active}
                                                            onChange={(e) => setData('is_active', e.target.checked)}
                                                            className="rounded text-amber-500"
                                                        />
                                                        <span className="text-sm text-amber-200">Active</span>
                                                    </label>
                                                    <div className="flex-1" />
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate(category)}
                                                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition"
                                                    >
                                                        <Save className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View Mode */
                                            <div className="flex items-center gap-4">
                                                <div className="cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-5 h-5 text-amber-500/50 group-hover:text-amber-500" />
                                                </div>

                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getColorClass(category.color)} border`}>
                                                    {category.icon || '🎬'}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-white">{category.name}</h3>
                                                        {!category.is_active && (
                                                            <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">Inactive</span>
                                                        )}
                                                    </div>
                                                    {category.description && (
                                                        <p className="text-sm text-amber-300/60 truncate">{category.description}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-amber-300/70">
                                                    <Film className="w-4 h-4" />
                                                    <span className="text-sm">{category.projects_count || 0} projects</span>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => startEdit(category)}
                                                        className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category)}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                        title="Delete"
                                                        disabled={category.projects_count > 0}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
