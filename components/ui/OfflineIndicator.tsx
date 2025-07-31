'use client';

import React from 'react';
import { Wifi, WifiOff, Download, X } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';

export function OfflineIndicator() {
  const { isOnline, isOffline, showInstallPrompt, installApp, dismissInstallPrompt } = useOffline();
  const { language } = useLanguage();

  if (!isOffline && !showInstallPrompt) {
    return null;
  }

  return (
    <>
      {/* Offline Status Badge */}
      {isOffline && (
        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 font-medium px-3 py-2 shadow-lg animate-pulse">
            <WifiOff className="w-4 h-4 mr-2" />
            {t('offline_mode', language)}
          </Badge>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="w-5 h-5 text-blue-500 mr-3" />
                             <div>
                 <h3 className="font-semibold text-gray-900">{t('install_app', language)}</h3>
                 <p className="text-sm text-gray-600">{t('get_best_experience', language)}</p>
               </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={installApp}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                                 {t('install', language)}
               </button>
              <button
                onClick={dismissInstallPrompt}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 