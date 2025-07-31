'use client';

import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { language, setLanguage, languageNames } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{languageNames[language]}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={`cursor-pointer ${language === 'en' ? 'bg-gray-100' : ''}`}
        >
          <span className="mr-2">🇺🇸</span>
          {languageNames.en}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('hi')}
          className={`cursor-pointer ${language === 'hi' ? 'bg-gray-100' : ''}`}
        >
          <span className="mr-2">🇮🇳</span>
          {languageNames.hi}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('te')}
          className={`cursor-pointer ${language === 'te' ? 'bg-gray-100' : ''}`}
        >
          <span className="mr-2">🇮🇳</span>
          {languageNames.te}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 