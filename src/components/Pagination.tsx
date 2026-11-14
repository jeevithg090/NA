import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, disabled, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <span className="px-2 text-sm text-muted-foreground" aria-current="page">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
