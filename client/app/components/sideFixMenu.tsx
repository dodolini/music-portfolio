
'use client';
import React, {FC, useState} from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const SideFixMenu: FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const t = useTranslations('languages');
    const currentLang = params?.locale as string || 'pl';
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const availableLocales = [
        { value: 'pl', label: t('pl') },
        { value: 'en', label: t('en') },
    ];

    const handleChange = (newLang: string) => {
        if (!newLang || newLang === currentLang) return;

        const segments = pathname.split('/').filter(Boolean);

        if (segments.length > 0) {
            segments[0] = newLang;
        } else {
            segments.push(newLang);
        }

        const newPath = '/' + segments.join('/');
        router.push(newPath);
        setIsMobileOpen(false);
    };

    const handleMobileClick = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    return (
        <>
            {/* Desktop version */}
            <div
                className="hidden md:block fixed top-[10%] right-0 z-50 bg-black text-gray-400 shadow-[-2px_2px_0px_0px_cyan]"
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className="flex flex-col">
                    {availableLocales.map((locale) => (
                        <button
                            key={locale.value}
                            onClick={() => handleChange(locale.value)}
                            className={`px-4 py-3 text-left transition-all duration-200 hover:bg-gray-800 border-b border-gray-700 last:border-b-0 ${
                                currentLang === locale.value ? 'text-white' : ''
                            }`}
                            style={{
                                minWidth: isExpanded ? '80px' : '30px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                            }}
                        >
                            <span className="inline-block" style={{ width: isExpanded ? 'auto' : '100%' }}>
                                {isExpanded ? locale.label : locale.value.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile version */}
            <div className="md:hidden fixed top-[10%] right-0 z-50 bg-black text-gray-400 shadow-[-2px_2px_0px_0px_cyan]">
                <button
                    onClick={handleMobileClick}
                    className="px-4 py-3 font-semibold"
                >
                    {currentLang.toUpperCase()}
                </button>
                {isMobileOpen && (
                    <div className="absolute top-full right-0 bg-black border-t border-gray-700 shadow-lg">
                        {availableLocales.map((locale) => (
                            <button
                                key={locale.value}
                                onClick={() => handleChange(locale.value)}
                                className={`block w-full px-4 py-3 text-left hover:bg-gray-800 border-b border-gray-700 last:border-b-0 whitespace-nowrap ${
                                    currentLang === locale.value ? 'text-white' : ''
                                }`}
                            >
                                {locale.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default SideFixMenu;