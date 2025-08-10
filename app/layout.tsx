import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { CustomerExperienceProvider } from '@/contexts/CustomerExperienceContext';
import { MenuProvider } from '@/contexts/MenuContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { RealTimeOrderProvider } from '@/contexts/RealTimeOrderContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Validate environment variables on app startup (skip during build time)
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    require('@/lib/env').validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In production, this should cause the app to fail
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sri Kanya Family Restaurant - Authentic Indian Cuisine',
  description: 'Discover our authentic Indian dishes, crafted with traditional recipes and fresh ingredients',
  keywords: 'Indian restaurant, biryani, curry, authentic cuisine, Sri Kanya',
  authors: [{ name: 'Sri Kanya Family Restaurant' }],
  openGraph: {
    title: 'Sri Kanya Family Restaurant - Authentic Indian Cuisine',
    description: 'Discover our authentic Indian dishes, crafted with traditional recipes and fresh ingredients',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical images for faster loading */}
        <link rel="preload" as="image" href="/menu-images/chicken_biryani.jpg" />
        <link rel="preload" as="image" href="/menu-images/paneer_butter_masala.jpg" />
        <link rel="preload" as="image" href="/menu-images/chicken_curry.jpg" />
        <link rel="preload" as="image" href="/menu-images/chicken_dum_biryani_half.jpg" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <OfflineProvider>
          <LanguageProvider>
            <AnalyticsProvider>
              <CustomerExperienceProvider>
                <MenuProvider>
                  <AdminProvider>
                    <RealTimeOrderProvider>
                                          <CartProvider>
                      <ErrorBoundary>
                        {children}
                        <Toaster />
                      </ErrorBoundary>
                    </CartProvider>
                    </RealTimeOrderProvider>
                  </AdminProvider>
                </MenuProvider>
              </CustomerExperienceProvider>
            </AnalyticsProvider>
          </LanguageProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}