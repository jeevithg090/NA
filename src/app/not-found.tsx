import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="container mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Page not found</h1>
      <p className="mb-6 text-muted-foreground">
        There is nothing here. The archive lives on the home page.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to the archive</Link>
      </Button>
    </main>
  );
}
