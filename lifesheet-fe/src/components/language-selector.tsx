import { useLanguage, languages, type Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSelector() {
    const { currentLanguage, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
                aria-expanded={isOpen}
            >
                <Globe className="h-4 w-4" />
                <span>{languages[currentLanguage]}</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-50 py-1 border">
                    {(Object.keys(languages) as Array<Language>).map((code) => (
                        <button
                            key={code}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLanguage === code ? 'font-bold bg-gray-50' : ''
                                }`}
                            onClick={() => {
                                setLanguage(code);
                                setIsOpen(false);
                            }}
                        >
                            {languages[code]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
