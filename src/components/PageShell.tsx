import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from '@/components/SiteHeader';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
