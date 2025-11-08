import React from 'react';
import useTheme from '@/Hooks/useTheme';

export default function ThemeSwitcher() {
    const { theme, toggle } = useTheme();

    return (
        <button onClick={toggle} className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
            {theme === 'dark' ? '🌙' : '☀️'}
        </button>
    );
}
