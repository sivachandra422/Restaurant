import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sri Kanya Restaurant - Authentic Indian Cuisine',
  description: 'Experience the finest Indian culinary traditions with our signature biryanis, rich curries, and time-honored recipes. Premium dining experience for families.',
  keywords: 'Sri Kanya, Indian restaurant, biryani, curry, family restaurant, authentic Indian food',
  authors: [{ name: 'Sri Kanya Restaurant' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#D4A574',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sri Kanya Restaurant" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <OfflineProvider>
          <LanguageProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LanguageProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}