import React from 'react';

function initials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserAvatar({ user, size = 8 }) {
    const px = size * 4;
    const name = user?.name ?? '';
    const text = initials(name);

    if (user?.avatar_url) {
        return (
            <img src={user.avatar_url} alt={name} className="rounded-full object-cover" style={{ width: `${px}px`, height: `${px}px` }} />
        );
    }

    const bg = 'bg-gray-600';
    return (
        <div className={`inline-flex items-center justify-center ${bg} text-white rounded-full`} style={{ width: `${px}px`, height: `${px}px` }} aria-hidden>
            <span className="text-sm font-semibold">{text}</span>
        </div>
    );
}
