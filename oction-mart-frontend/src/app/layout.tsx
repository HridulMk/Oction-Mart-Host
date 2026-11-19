// app/layout.tsx
// This is the root layout for all pages in the App Router.
// Header and Footer are placed here for consistency across the entire application.

 // Corrected import path for globals.css
// oction-mart-frontend/app/layout.tsx

import '../../styles/globals.css';



import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import the Inter font

import Footer from '@/components/Footer'; // Import Footer component
import { AuthProvider } from '@/context/AuthContext';
import ConditionalHeader from '@/components/ConditionalHeader';

const inter = Inter({ subsets: ['latin'] }); // Initialize Inter font

export const metadata: Metadata = {
  title: 'Oction Mart',
  description: 'A Live Auction Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply Inter font class to body */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ConditionalHeader />
          {/* Header will appear on all pages */}
          {/* 'children' represents the content of the current page (e.g., app/page.tsx, app/explore-auctions/page.tsx) */}
          {/* <div className="bg-red-500 text-white p-4">Tailwind is working!</div> */}

          <main className="flex-grow">
              {children}
          </main>

          {/* Footer will appear on all pages */}
          <Footer />
          {/* Font Awesome for icons (social media) - loaded globally */}
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
        </AuthProvider>
      </body>
    </html>
    

  );
}
