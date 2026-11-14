import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, disabled, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={disabled || atStart}
        aria-label="First page"
        className="hidden sm:inline-flex"
      >
        <ChevronsLeft aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || atStart}
        aria-label="Previous page"
        className="px-3"
      >
        <ChevronLeft aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <p className="min-w-[7.5rem] px-2 text-center text-sm tabular-nums text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{' '}
        {totalPages.toLocaleString('en-IN')}
      </p>
      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || atEnd}
        aria-label="Next page"
        className="px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={disabled || atEnd}
        aria-label="Last page"
        className="hidden sm:inline-flex"
      >
        <ChevronsRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
