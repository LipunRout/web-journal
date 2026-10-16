import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Poppins, Cormorant_Garamond } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/lib/supabase/auth';

const sans = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Web Journal', template: '%s | Web Journal' },
  description: 'Write and publish articles about web development. Sign in with Google and go live in minutes.',
  openGraph: { type: 'website', siteName: 'Web Journal' },
  icons: { icon: '/brand/web-journal-mark.png' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d13' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}