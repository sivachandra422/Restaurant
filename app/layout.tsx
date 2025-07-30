import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';

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
  title: 'Sri Kanya Family Restaurants - Authentic Indian Cuisine',
  description: 'Experience the finest Indian culinary traditions with our signature biryanis, rich curries, and time-honored recipes. Premium dining experience for families.',
  keywords: 'Sri Kanya, Indian restaurant, biryani, curry, family restaurant, authentic Indian food',
  authors: [{ name: 'Sri Kanya Family Restaurants' }],
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
      <body className={`${inter.className} antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}