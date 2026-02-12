'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useState, useRef, useEffect } from 'react';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function LanguageSwitcher() {
    const { language, changeLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
        { code: 'ar', name: 'العربية' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-secondary hover:text-primary transition-colors focus:outline-none p-2 rounded-md hover:bg-secondary/10"
            >
                <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
                <span className="ml-2 text-sm font-medium uppercase hidden md:block">{language}</span>
                <ChevronDownIcon className="h-3 w-3 ml-1 hidden md:block text-tertiary" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                document.cookie = `language=${lang.code}; path=/; max-age=31536000; samesite=lax`;
                                changeLanguage(lang.code as 'en' | 'fr' | 'ar');
                                setIsOpen(false);
                                window.location.reload();
                            }}
                            className={classNames(
                                language === lang.code ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
                                'block w-full px-4 py-2 text-sm text-left transition-colors'
                            )}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
