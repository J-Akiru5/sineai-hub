import { useTheme, THEMES } from '@/Contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

/**
 * Simple toggle button for switching between light and dark themes
 */
export function ThemeToggle({ className = '' }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-lg transition-all duration-300 ${
                isDark 
                    ? 'bg-slate-700/50 text-amber-400 hover:bg-slate-600/50' 
                    : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
            } ${className}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <SunIcon 
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                        isDark 
                            ? 'opacity-0 rotate-90 scale-0' 
                            : 'opacity-100 rotate-0 scale-100'
                    }`} 
                />
                {/* Moon icon */}
                <MoonIcon 
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                        isDark 
                            ? 'opacity-100 rotate-0 scale-100' 
                            : 'opacity-0 -rotate-90 scale-0'
                    }`} 
                />
            </div>
        </button>
    );
}

/**
 * Dropdown menu for selecting light, dark, or system theme
 */
export function ThemeSelector({ className = '' }) {
    const { theme, setTheme, isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { value: THEMES.LIGHT, label: 'Light', icon: SunIcon },
        { value: THEMES.DARK, label: 'Dark', icon: MoonIcon },
        { value: THEMES.SYSTEM, label: 'System', icon: ComputerDesktopIcon },
    ];

    const currentOption = options.find(opt => opt.value === theme) || options[1];
    const CurrentIcon = currentOption.icon;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isDark 
                        ? 'bg-slate-700/50 text-amber-100 hover:bg-slate-600/50' 
                        : 'bg-amber-100 text-slate-700 hover:bg-amber-200'
                }`}
                aria-label="Select theme"
            >
                <CurrentIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{currentOption.label}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-50 ${
                    isDark 
                        ? 'bg-slate-800 border-white/10' 
                        : 'bg-white border-slate-200'
                }`}>
                    <div className="py-1">
                        {options.map((option) => {
                            const Icon = option.icon;
                            const isSelected = theme === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setTheme(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        isSelected
                                            ? isDark 
                                                ? 'bg-amber-500/10 text-amber-400' 
                                                : 'bg-amber-100 text-amber-700'
                                            : isDark
                                                ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{option.label}</span>
                                    {isSelected && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Animated toggle switch for light/dark theme
 */
export function ThemeSwitch({ className = '' }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                isDark 
                    ? 'bg-slate-700 focus:ring-offset-slate-800' 
                    : 'bg-amber-400 focus:ring-offset-white'
            } ${className}`}
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle theme"
        >
            {/* Background icons */}
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-amber-300 opacity-50">
                <SunIcon className="w-4 h-4" />
            </span>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 opacity-50">
                <MoonIcon className="w-4 h-4" />
            </span>

            {/* Toggle circle */}
            <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
            >
                {isDark ? (
                    <MoonIcon className="w-4 h-4 text-slate-700" />
                ) : (
                    <SunIcon className="w-4 h-4 text-amber-500" />
                )}
            </span>
        </button>
    );
}

export default ThemeToggle;
