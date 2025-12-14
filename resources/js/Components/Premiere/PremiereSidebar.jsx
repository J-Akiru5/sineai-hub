import React, { useState } from 'react';
import CommentSection from '@/Components/Premiere/CommentSection';

const DEFAULT_NOTES = [
    { time: '0:30', note: 'This shot took 15 takes!' },
    { time: '1:10', note: 'Lighting was adjusted in post for this scene.' },
    { time: '2:45', note: 'Improvised dialogue moment.' },
];

export default function PremiereSidebar({ comments, projectId, notes = DEFAULT_NOTES }) {
    const [activeTab, setActiveTab] = useState('chat');

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
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b ${activeTab === 'notes' ? 'text-amber-300 border-amber-400' : 'text-slate-300 border-transparent hover:text-amber-200'}`}
                >
                    Director&apos;s Notes
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'chat' ? (
                    <CommentSection comments={comments} projectId={projectId} />
                ) : (
                    <div className="space-y-3">
                        {notes.map((item, idx) => (
                            <div key={`${item.time}-${idx}`} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-xs uppercase tracking-wide text-amber-300">{item.time}</div>
                                <div className="text-sm text-slate-100 mt-1">{item.note}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
