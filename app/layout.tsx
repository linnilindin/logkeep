import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  variable: '--font-title',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}

