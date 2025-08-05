'use client';

import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languageFlags } from '@/lib/translations';

export function LanguageSwitcher() {
  const { language, setLanguage, languageNames } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    setIsOpen(false);
    
    // Add a small delay to show the language change animation
    setTimeout(() => {
      // Trigger a custom event to notify other components about language change
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: newLanguage }
      }));
    }, 100);
  };

  const languages = [
    { code: 'en', name: languageNames.en, flag: languageFlags.en },
    { code: 'hi', name: languageNames.hi, flag: languageFlags.hi },
    { code: 'te', name: languageNames.te, flag: languageFlags.te },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group"
        >
          <Globe className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
          <span className="hidden sm:inline font-medium">{languageNames[language]}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-orange-50 hover:text-orange-700 ${
              language === lang.code ? 'bg-orange-100 text-orange-700' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {language === lang.code && (
                <Check className="w-4 h-4 text-orange-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 