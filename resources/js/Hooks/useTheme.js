import { useEffect, useState } from 'react';

const THEME_KEY = 'sineai_theme';

export default function useTheme() {
    const [theme, setTheme] = useState(() => {
        try {
            const stored = localStorage.getItem(THEME_KEY);
            return stored ?? 'system';
        } catch (e) {
            return 'system';
        }
    });

    useEffect(() => {
        const apply = (t) => {
            const root = document.documentElement;
            if (t === 'dark') {
                root.classList.add('dark');
            } else if (t === 'light') {
                root.classList.remove('dark');
            } else {
                // system
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
            }
        };

        apply(theme);

        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }
    }, [theme]);

    const toggle = () => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    };

    return { theme, setTheme, toggle };
}
