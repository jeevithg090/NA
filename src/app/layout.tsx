import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const title = 'Papers, Please';
const description =
  'Search and filter MIT Manipal previous-year question papers by year, programme, term, semester and branch.';

function siteUrl(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: title, template: `%s · ${title}` },
  description,
  applicationName: title,
  keywords: ['MIT Manipal', 'question papers', 'previous year papers', 'MAHE', 'exam archive'],
  openGraph: { type: 'website', title, description, siteName: title },
  twitter: { card: 'summary', title, description },
};

export const viewport: Viewport = {
  themeColor: '#0f1729',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
