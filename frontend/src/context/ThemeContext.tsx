/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Check if it's night time (7 PM to 6 AM)
function isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 6;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('themeMode') as ThemeMode;
        return saved || 'auto';
    });

    const [theme, setTheme] = useState<Theme>(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode === 'light') return 'light';
        if (savedMode === 'dark') return 'dark';
        if (isNightTime()) return 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (themeMode === 'auto') {
            const checkTime = () => setTheme(isNightTime() ? 'dark' : 'light');
            checkTime();
            const interval = setInterval(checkTime, 60000);
            return () => clearInterval(interval);
        } else {
            setTheme(themeMode);
        }
    }, [themeMode]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode(prev => {
            if (prev === 'auto') return 'light';
            if (prev === 'light') return 'dark';
            return 'auto';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}
