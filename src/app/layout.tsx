import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta'
})

export const metadata: Metadata = {
  title: {
    default: 'ArtistHub - Artist & Manager Dashboard',
    template: '%s | ArtistHub'
  },
  description: 'The ultimate platform for artists and managers to grow their careers, manage bookings, engage fans, and track success with AI-powered insights.',
  keywords: [
    'artist management',
    'music industry',
    'social media management',
    'gig booking',
    'fan engagement',
    'music analytics',
    'tour planning',
    'contract management'
  ],
  authors: [{ name: 'ArtistHub Team' }],
  creator: 'ArtistHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: import.meta.env.VITE_APP_URL,
    siteName: 'ArtistHub',
    title: 'ArtistHub - Artist & Manager Dashboard',
    description: 'The ultimate platform for artists and managers to grow their careers',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ArtistHub Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtistHub - Artist & Manager Dashboard',
    description: 'The ultimate platform for artists and managers to grow their careers',
    images: ['/og-image.jpg'],
    creator: '@artisthub'
  },
  robots: {
    index: false, // Set to true in production
    follow: false, // Set to true in production
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, jakarta.variable)}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30',
        'font-sans antialiased selection:bg-purple-100 selection:text-purple-900',
        'dark:from-slate-900 dark:via-purple-900/10 dark:to-cyan-900/10'
      )}>
        <QueryProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontSize: '14px',
                padding: '16px',
                maxWidth: '400px'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff'
                }
              },
              loading: {
                iconTheme: {
                  primary: '#7c3aed',
                  secondary: '#ffffff'
                }
              }
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
} 