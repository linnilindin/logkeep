import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { SerwistProvider } from '@serwist/turbopack/react';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  variable: '--font-title',
  weight: ['400', '500', '600', '700'],
});

const APP_NAME = 'LogKeep';
const APP_DESCRIPTION =
  'Track your reading progress across manga, manhwa, novels, and books.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: '/favicon.jpg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets the app fill the screen on notched devices. Components claw back the
  // unusable strips with the safe-area utilities in globals.css.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${inter.className}`}>
        <SerwistProvider swUrl="/serwist/sw.js">
          <AuthProvider>{children}</AuthProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
