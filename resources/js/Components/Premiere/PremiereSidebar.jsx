import React, { useState } from 'react';
import CommentSection from '@/Components/Premiere/CommentSection';

export default function PremiereSidebar({ comments, projectId, notes = [], playlistMode = false, playlistItems = [] }) {
    const defaultTab = playlistMode ? 'queue' : 'chat';
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md h-full flex flex-col overflow-hidden">
            <div className="flex">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b ${activeTab === 'chat' ? 'text-amber-300 border-amber-400' : 'text-slate-300 border-transparent hover:text-amber-200'}`}
                >
                    Live Chat
                </button>
                <button
                    onClick={() => setActiveTab('queue')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b ${activeTab === 'queue' ? 'text-amber-300 border-amber-400' : 'text-slate-300 border-transparent hover:text-amber-200'}`}
                >
                    Queue
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b ${activeTab === 'notes' ? 'text-amber-300 border-amber-400' : 'text-slate-300 border-transparent hover:text-amber-200'}`}
                >
                    Director&apos;s Notes
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'chat' && <CommentSection comments={comments} projectId={projectId} />}

                {activeTab === 'queue' && (
                    <div className="space-y-3">
                        {playlistItems.length === 0 ? (
                            <div className="text-sm text-slate-200">No playlist items available.</div>
                        ) : (
                            playlistItems.map((item) => (
                                <a key={item.id} href={route('premiere.show', item.id)} className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400 transition">
                                    <div className="w-16 h-10 rounded overflow-hidden bg-slate-800">
                                        <img src={item.thumbnail_url || item.video_url} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-white line-clamp-2">{item.title}</div>
                                        <div className="text-xs text-amber-300">{item.user?.name}</div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-3">
                        {notes.length === 0 ? (
                            <div className="text-sm text-slate-400 text-center py-8">
                                No director's notes available for this video.
                            </div>
                        ) : (
                            notes.map((item, idx) => (
                                <div key={`${item.time}-${idx}`} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="text-xs uppercase tracking-wide text-amber-300">{item.time}</div>
                                    <div className="text-sm text-slate-100 mt-1">{item.note}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
