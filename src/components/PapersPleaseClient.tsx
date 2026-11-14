'use client';

import { AlertCircle, Loader2, RotateCcw, Search } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Filters } from '@/components/Filters';
import { Pagination } from '@/components/Pagination';
import { PaperList } from '@/components/PaperList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchFilterOptions, fetchPapers } from '@/lib/api/client';
import {
  ALL,
  DEFAULT_PAGE_SIZE,
  FILTER_LEVELS,
  MAX_SEARCH_LENGTH,
  emptyFilters,
  setFilterCascading,
  type ActiveFilters,
  type FilterLevel,
  type FilterOptions,
} from '@/lib/papers/filters';
import type { PapersPage } from '@/lib/papers/query';

const SEARCH_DEBOUNCE_MS = 400;

interface Query {
  filters: ActiveFilters;
  search: string;
  page: number;
}

interface PapersPleaseClientProps {
  initialOptions: FilterOptions;
  initialPage: PapersPage;
}

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

export function PapersPleaseClient({ initialOptions, initialPage }: PapersPleaseClientProps) {
  // The server already rendered the unfiltered first page and options for this query,
  // so the fetch effects skip it (by identity, which also holds under Strict Mode).
  const [initialQuery] = useState<Query>(() => ({ filters: emptyFilters(), search: '', page: 1 }));
  const [query, setQuery] = useState<Query>(initialQuery);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const [data, setData] = useState<PapersPage>(initialPage);
  const [options, setOptions] = useState<FilterOptions>(initialOptions);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const searchId = useId();
  const resultsRef = useRef<HTMLElement>(null);

  // A new search always starts from the first page.
  useEffect(() => {
    setQuery((q) =>
      q.search === debouncedSearch ? q : { ...q, search: debouncedSearch, page: 1 },
    );
  }, [debouncedSearch]);

  useEffect(() => {
    if (query === initialQuery && reloadToken === 0) return;
    const controller = new AbortController();
    setIsLoadingPapers(true);
    setError(null);

    fetchPapers({ ...query, pageSize: DEFAULT_PAGE_SIZE }, controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (isAbort(err)) return;
        console.error('Failed to fetch papers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch papers.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPapers(false);
      });

    return () => controller.abort();
  }, [query, reloadToken, initialQuery]);

  useEffect(() => {
    if (query.filters === initialQuery.filters) return;
    const controller = new AbortController();
    setIsLoadingOptions(true);

    Promise.all(
      FILTER_LEVELS.map((level) =>
        fetchFilterOptions(level, query.filters, controller.signal).then(
          (values) => [level, values] as const,
        ),
      ),
    )
      .then((entries) => setOptions(Object.fromEntries(entries) as FilterOptions))
      .catch((err: unknown) => {
        // Keep the previous options; the paper request surfaces any outage to the user.
        if (!isAbort(err)) console.error('Failed to fetch filter options:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingOptions(false);
      });

    return () => controller.abort();
  }, [query.filters, initialQuery.filters]);

  const handleFilterChange = useCallback((level: FilterLevel, value: string) => {
    setQuery((q) => ({ ...q, filters: setFilterCascading(q.filters, level, value), page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQuery((q) => ({ ...q, page }));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleReset = useCallback(() => {
    // Returning to the initial query restores the server-rendered data without a request.
    setSearchInput('');
    setQuery(initialQuery);
    setData(initialPage);
    setOptions(initialOptions);
    setError(null);
    setIsLoadingPapers(false);
    setIsLoadingOptions(false);
  }, [initialQuery, initialPage, initialOptions]);

  const hasActiveFilters =
    Object.values(query.filters).some((value) => value !== ALL) || searchInput.trim() !== '';
  const isSearchPending = searchInput.trim() !== query.search;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="mb-8 space-y-5">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Search papers by name or subject
          </label>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={searchId}
            type="search"
            inputMode="search"
            autoComplete="off"
            maxLength={MAX_SEARCH_LENGTH}
            placeholder={`Search ${initialPage.total.toLocaleString('en-IN')} papers by name or subject…`}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-9 w-full bg-background pl-8 pr-8 text-sm shadow-none"
          />
          {(isSearchPending || (isLoadingPapers && query.search)) && (
            <Loader2
              className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-grow">
            <Filters
              options={options}
              activeFilters={query.filters}
              onFilterChange={handleFilterChange}
              isLoading={isLoadingOptions}
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={!hasActiveFilters}
                className="h-9 self-end px-3 text-muted-foreground hover:text-primary"
                aria-label="Reset search and filters"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span className="ml-1.5 md:sr-only">Reset</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset search and filters</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator className="mb-6" />

      <section
        ref={resultsRef}
        aria-labelledby="results-heading"
        aria-busy={isLoadingPapers}
        className="scroll-mt-6"
      >
        <div className="mb-4 flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <h2 id="results-heading" className="font-normal" aria-live="polite">
            {error
              ? 'Results unavailable'
              : `${data.total.toLocaleString('en-IN')} ${data.total === 1 ? 'paper' : 'papers'} found`}
          </h2>
          {isLoadingPapers && (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading…
            </span>
          )}
        </div>

        {error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Could not load papers</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={() => setReloadToken((n) => n + 1)}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : data.results.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
            <p className="text-base">No papers found matching your criteria.</p>
            <p className="text-sm">Try a different search term or fewer filters.</p>
          </div>
        ) : (
          <div className={isLoadingPapers ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <PaperList papers={data.results} />
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              disabled={isLoadingPapers}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
