import { Github } from 'lucide-react';

const REPO_URL = 'https://github.com/NilayShenai/Papers-Please';

export function SiteHeader() {
  return (
    <header className="relative mb-8 text-center">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-0 top-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Source code on GitHub (opens in a new tab)"
        title="Source code on GitHub"
      >
        <Github className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </a>
      <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Papers, Please</h1>
      <p className="text-muted-foreground">MIT Manipal Library: Revamped</p>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t pt-6 text-center text-xs text-muted-foreground">
      <p>
        Papers are linked directly from the{' '}
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
