import { Github, Library } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

const REPO_URL = 'https://github.com/NilayShenai/Papers-Please';

export function SiteHeader() {
  return (
    <header className="mb-10 md:mb-12">
      <div className="mb-10 flex items-center justify-between gap-4 md:mb-14">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Library className="h-4 w-4" aria-hidden="true" />
          </span>
          Papers, Please
        </Link>
        <nav aria-label="Site" className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Source code on GitHub (opens in a new tab)"
              title="Source code on GitHub"
            >
              <Github aria-hidden="true" />
            </a>
          </Button>
        </nav>
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Find MIT Manipal question papers, fast
        </h1>
        <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
          Search the library&apos;s previous-year papers by subject or course code, then narrow down
          by year, programme, term, semester and branch.
        </p>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t pt-6 text-center text-xs leading-relaxed text-muted-foreground">
      <p>
        Papers open directly from the{' '}
        <a
          href="https://libportal.manipal.edu/MIT/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          MIT Manipal library portal
        </a>
        . Not affiliated with MAHE.
      </p>
      <p className="mt-1">
        Originally created by{' '}
        <a
          href="https://github.com/NilayShenai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Nilay D. Shenai
        </a>
        .
      </p>
    </footer>
  );
}
