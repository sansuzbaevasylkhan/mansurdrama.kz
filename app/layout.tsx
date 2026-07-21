import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { getSiteUrl } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = getSiteUrl();
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'MansurDrama.kz';
const SITE_DESCRIPTION =
  'Қазақстандағы ең жылдам қысқа дорамалар платформасы. HD сапада, кез-келген құрылғыда көріңіз.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Қысқа дорамалар HD`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['дорама', 'драма', 'қазақша', 'HD', 'фильм', 'сериал', 'streaming'],
  authors: [{ name: 'MansurDrama Team' }],
  creator: 'MansurDrama Team',
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'kk_KZ',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Қысқа дорамалар HD`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Қысқа дорамалар HD`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a10' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="kk" className={inter.className} suppressHydrationWarning>
      <body className="bg-dark-950 text-white antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
