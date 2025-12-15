import { useLanguage, LANGUAGES, LANGUAGE_NAMES } from '@/Contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline';

/**
 * Language selector dropdown
 */
export function LanguageSelector({ className = '' }) {
    const { language, changeLanguage } = useLanguage();
    const { isDark } = useTheme();
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

    const languages = [
        { value: LANGUAGES.EN, label: LANGUAGE_NAMES.en, flag: '🇺🇸' },
        { value: LANGUAGES.TL, label: LANGUAGE_NAMES.tl, flag: '🇵🇭' },
    ];

    const currentLanguage = languages.find(lang => lang.value === language) || languages[0];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isDark 
                        ? 'bg-slate-700/50 text-amber-100 hover:bg-slate-600/50' 
                        : 'bg-amber-100 text-slate-700 hover:bg-amber-200'
                }`}
                aria-label="Select language"
            >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="text-sm font-medium hidden sm:inline">{currentLanguage.label}</span>
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
                        {languages.map((lang) => {
                            const isSelected = language === lang.value;
                            return (
                                <button
                                    key={lang.value}
                                    onClick={() => {
                                        changeLanguage(lang.value);
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
                                    <span className="text-lg">{lang.flag}</span>
                                    <span>{lang.label}</span>
                                    {isSelected && (
                                        <CheckIcon className="w-4 h-4 ml-auto" />
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
 * Simple language toggle button (EN/TL)
 */
export function LanguageToggle({ className = '' }) {
    const { language, changeLanguage } = useLanguage();
    const { isDark } = useTheme();

    const toggleLanguage = () => {
        changeLanguage(language === LANGUAGES.EN ? LANGUAGES.TL : LANGUAGES.EN);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isDark 
                    ? 'bg-slate-700/50 text-amber-100 hover:bg-slate-600/50' 
                    : 'bg-amber-100 text-slate-700 hover:bg-amber-200'
            } ${className}`}
            aria-label={`Switch to ${language === LANGUAGES.EN ? 'Tagalog' : 'English'}`}
        >
            <GlobeAltIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
                {language === LANGUAGES.EN ? '🇺🇸 EN' : '🇵🇭 TL'}
            </span>
        </button>
    );
}

export default LanguageSelector;
