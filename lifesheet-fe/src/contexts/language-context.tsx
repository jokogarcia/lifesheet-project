import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define supported languages
export type Language = 'en' | 'es' | 'de';

export const languages: Record<Language, string> = {
    en: 'English',
    es: 'Español',
    de: 'Deutsch'
};

interface LanguageContextType {
    currentLanguage: Language;
    setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize with browser language or default to English
    const getBrowserLanguage = (): Language => {
        const browserLang = navigator.language.split('-')[0];
        return (browserLang === 'en' || browserLang === 'es' || browserLang === 'de')
            ? browserLang as Language
            : 'en';
    };

    // Try to get language from localStorage, or fallback to browser language
    const getInitialLanguage = (): Language => {
        const savedLanguage = localStorage.getItem('language') as Language;
        return (savedLanguage === 'en' || savedLanguage === 'es' || savedLanguage === 'de')
            ? savedLanguage
            : getBrowserLanguage();
    };

    const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage());

    // Save language preference to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('language', currentLanguage);
    }, [currentLanguage]);

    const setLanguage = (language: Language) => {
        setCurrentLanguage(language);
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
