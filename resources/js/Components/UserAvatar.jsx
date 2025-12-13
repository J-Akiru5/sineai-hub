import React from 'react';

function initials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserAvatar({ user, size = 8 }) {
    const sClass = `h-${size} w-${size}`; // Tailwind sizes dynamic not ideal but acceptable for default sizes
    const bg = 'bg-gray-600';
    const name = user?.name ?? '';
    const text = initials(name);

    return (
        <div className={`inline-flex items-center justify-center ${bg} text-white rounded-full`} style={{ width: `${size * 4}px`, height: `${size * 4}px` }} aria-hidden>
            <span className="text-sm font-semibold">{text}</span>
        </div>
    );
}
