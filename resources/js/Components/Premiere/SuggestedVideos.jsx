import React from 'react';
import { Link } from '@inertiajs/react';

export default function SuggestedVideos({ videos = [] }) {
    if (!videos || videos.length === 0) return null;

    return (
        <aside className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Suggested</h2>
            <div className="space-y-2">
                {videos.map((v) => (
                    <Link key={v.id} href={route('premiere.show', v.id)} className="flex items-center gap-3 p-2 rounded hover:bg-white/5">
                        <div className="w-20 h-12 flex-shrink-0 overflow-hidden rounded bg-black">
                            <img src={v.thumbnail_url || v.video_url} alt={v.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-white text-sm">
                            <div className="font-medium truncate">{v.title}</div>
                            <div className="text-xs text-amber-300 truncate">{v.user?.name}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}
