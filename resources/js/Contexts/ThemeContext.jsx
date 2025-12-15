import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored && Object.values(THEMES).includes(stored)) {
                return stored;
            }
        }
        return THEMES.DARK; // Default to dark theme
    });

    const [resolvedTheme, setResolvedTheme] = useState(THEMES.DARK);

    // Resolve the actual theme (handles 'system' preference)
    useEffect(() => {
        const resolveTheme = () => {
            if (theme === THEMES.SYSTEM) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                return prefersDark ? THEMES.DARK : THEMES.LIGHT;
            }
            return theme;
        };

        const resolved = resolveTheme();
        setResolvedTheme(resolved);

        // Apply theme to document
        const root = document.documentElement;
        
        if (resolved === THEMES.DARK) {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        // Store in localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system theme changes when using 'system' preference
    useEffect(() => {
        if (theme !== THEMES.SYSTEM) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            setResolvedTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
            const root = document.documentElement;
            if (e.matches) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
    };

    const setThemeMode = (mode) => {
        if (Object.values(THEMES).includes(mode)) {
            setTheme(mode);
        }
    };

    const isDark = resolvedTheme === THEMES.DARK;

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            resolvedTheme, 
            isDark,
            toggleTheme, 
            setTheme: setThemeMode 
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
