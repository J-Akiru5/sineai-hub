import React from 'react';

/**
 * UserBadge Component
 * Displays role/position badges with consistent styling across the application.
 * 
 * Hierarchy:
 * - President: Platinum/Amber gradient (highest distinction)
 * - Officer: Gold badge
 * - Admin: Purple badge
 * - Member: Slate badge (default)
 */

const badgeStyles = {
    president: {
        wrapper: 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-amber-900',
        glow: 'shadow-lg shadow-amber-400/30',
        icon: '👑',
    },
    vicePresident: {
        wrapper: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900',
        glow: 'shadow-md shadow-amber-300/20',
        icon: '⭐',
    },
    officer: {
        wrapper: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
        glow: 'shadow-md shadow-amber-500/20',
        icon: '🎖️',
    },
    admin: {
        wrapper: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
        glow: 'shadow-md shadow-purple-500/20',
        icon: '🛡️',
    },
    superAdmin: {
        wrapper: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
        glow: 'shadow-md shadow-red-500/20',
        icon: '⚡',
    },
    member: {
        wrapper: 'bg-slate-700 text-slate-300',
        glow: '',
        icon: null,
    },
};

/**
 * Determine badge type from user data
 */
const getBadgeType = (user) => {
    if (!user) return 'member';

    const position = user.position?.toLowerCase() || '';
    const roles = user.roles || [];
    const roleNames = roles.map(r => (typeof r === 'string' ? r : r.name)?.toLowerCase());

    // Check position first (highest priority)
    if (position === 'president') return 'president';
    if (position === 'vice president') return 'vicePresident';

    // Check roles
    if (roleNames.includes('super-admin')) return 'superAdmin';
    if (roleNames.includes('admin')) return 'admin';
    if (roleNames.includes('officer')) return 'officer';

    // Check if they have any leadership position
    if (position && position.includes('director')) return 'officer';

    return 'member';
};

/**
 * Get display label for badge
 */
const getBadgeLabel = (user, badgeType) => {
    if (user?.position) {
        // Shorten common positions for badge display
        const position = user.position;
        if (position === 'President') return 'President';
        if (position === 'Vice President') return 'Vice President';
        if (position === 'Secretary') return 'Secretary';
        if (position.includes('Director of')) {
            return position.replace('Director of ', 'Dir. ');
        }
        return position;
    }

    // Fall back to role name
    switch (badgeType) {
        case 'superAdmin': return 'Super Admin';
        case 'admin': return 'Admin';
        case 'officer': return 'Officer';
        default: return 'Member';
    }
};

export default function UserBadge({ 
    user, 
    showIcon = true, 
    showLabel = true,
    size = 'sm', // 'xs', 'sm', 'md', 'lg'
    className = '',
    compact = false,
}) {
    const badgeType = getBadgeType(user);
    const style = badgeStyles[badgeType];
    const label = getBadgeLabel(user, badgeType);

    // Size classes
    const sizeClasses = {
        xs: 'text-[10px] px-1.5 py-0.5',
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    // Don't show badge for regular members unless explicitly requested
    if (badgeType === 'member' && !showLabel) {
        return null;
    }

    return (
        <span
            className={`
                inline-flex items-center gap-1 rounded-full font-medium
                ${style.wrapper} ${style.glow} ${sizeClasses[size]}
                ${className}
            `}
        >
            {showIcon && style.icon && (
                <span className="flex-shrink-0">{style.icon}</span>
            )}
            {showLabel && !compact && (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </span>
    );
}

/**
 * Compact badge for inline use (chat, lists)
 */
export function UserBadgeCompact({ user, className = '' }) {
    return <UserBadge user={user} showLabel={false} size="xs" className={className} />;
}

/**
 * Position text display (for under names)
 */
export function UserPosition({ user, className = '' }) {
    if (!user?.position) return null;

    const badgeType = getBadgeType(user);
    const isLeadership = ['president', 'vicePresident', 'officer'].includes(badgeType);

    return (
        <span className={`text-xs ${isLeadership ? 'text-amber-400' : 'text-slate-500'} ${className}`}>
            {user.position}
        </span>
    );
}

/**
 * Check if user is in leadership
 */
export function isLeadership(user) {
    const badgeType = getBadgeType(user);
    return ['president', 'vicePresident', 'officer', 'admin', 'superAdmin'].includes(badgeType);
}

/**
 * Check if user is president
 */
export function isPresident(user) {
    return user?.position?.toLowerCase() === 'president';
}
