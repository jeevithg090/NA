'use client';

import { AlertCircle, Loader2, Search, SearchX, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ActiveFilters } from '@/components/ActiveFilters';
import { Filters } from '@/components/Filters';
import { Pagination } from '@/components/Pagination';
import { PaperList, PaperListSkeleton } from '@/components/PaperList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchFilterOptions, fetchPapers } from '@/lib/api/client';
import {
  ALL,
  DEFAULT_PAGE_SIZE,
  FILTER_LEVELS,
  MAX_SEARCH_LENGTH,
  emptyFilters,
  setFilterCascading,
  type FilterLevel,
  type FilterOptions,
} from '@/lib/papers/filters';
import type { PapersPage } from '@/lib/papers/query';
import {
  isDefaultState,
  parseUrlState,
  serializeUrlState,
  type UrlState,
} from '@/lib/papers/url-state';

const SEARCH_DEBOUNCE_MS = 350;

type Query = UrlState;

interface PapersPleaseClientProps {
  initialOptions: FilterOptions;
  initialPage: PapersPage;
}

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';
const formatCount = (n: number) => n.toLocaleString('en-IN');

export function PapersPleaseClient({ initialOptions, initialPage }: PapersPleaseClientProps) {
  // The server rendered the unfiltered first page and options for this exact query object,
  // so the fetch effects skip it (compared by identity, which also holds under Strict Mode).
  const [initialQuery] = useState<Query>(() => ({ filters: emptyFilters(), search: '', page: 1 }));
  const [query, setQuery] = useState<Query>(initialQuery);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const lastDebouncedSearch = useRef(debouncedSearch);

  const [data, setData] = useState<PapersPage>(initialPage);
  const [options, setOptions] = useState<FilterOptions>(initialOptions);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  // Restore a shared or bookmarked view from the URL (?q=…&year=…&page=…).
  useEffect(() => {
    const fromUrl = parseUrlState(window.location.search);
    if (isDefaultState(fromUrl)) return;
    setSearchInput(fromUrl.search);
    lastDebouncedSearch.current = fromUrl.search;
    setQuery(fromUrl);
  }, []);

  // Keep the URL in sync so the current view can be shared or bookmarked.
  useEffect(() => {
    if (query === initialQuery) return;
    const next = `${window.location.pathname}${serializeUrlState(query)}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', next);
    }
  }, [query, initialQuery]);

  // A new search term always starts from the first page.
  useEffect(() => {
    if (debouncedSearch === lastDebouncedSearch.current) return;
    lastDebouncedSearch.current = debouncedSearch;
    setQuery((q) =>
      q.search === debouncedSearch ? q : { ...q, search: debouncedSearch, page: 1 },
    );
  }, [debouncedSearch]);

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="listbox"]'))
        return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (query === initialQuery && reloadToken === 0) return;
    const controller = new AbortController();
    setIsLoadingPapers(true);
    setError(null);

    fetchPapers({ ...query, pageSize: DEFAULT_PAGE_SIZE }, controller.signal)
      .then((page) => {
        // A stale or hand-edited URL can point past the last page; jump to the last real one.
        if (page.results.length === 0 && page.total > 0 && query.page > page.totalPages) {
          setQuery((q) => ({ ...q, page: page.totalPages }));
          return;
        }
        setData(page);
      })
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

  const handleClearFilter = useCallback((level: FilterLevel) => {
    setQuery((q) => ({ ...q, filters: { ...q.filters, [level]: ALL }, page: 1 }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    lastDebouncedSearch.current = '';
    setQuery((q) => (q.search ? { ...q, search: '', page: 1 } : q));
    searchRef.current?.focus();
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQuery((q) => ({ ...q, page }));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleReset = useCallback(() => {
    // Returning to the initial query restores the server-rendered data without a request.
    setSearchInput('');
    lastDebouncedSearch.current = '';
    setQuery(initialQuery);
    setData(initialPage);
    setOptions(initialOptions);
    setError(null);
    setIsLoadingPapers(false);
    setIsLoadingOptions(false);
    window.history.replaceState(null, '', window.location.pathname);
  }, [initialQuery, initialPage, initialOptions]);

  const isSearchPending = searchInput.trim() !== query.search;
  const showSpinner = isSearchPending || isLoadingPapers;

  return (
    <>
      <section aria-label="Search and filters" className="mb-8 space-y-4">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Search papers by name, subject or course code
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={searchRef}
            id={searchId}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="Search subject or course code"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && searchInput) {
                event.preventDefault();
                handleClearSearch();
              }
            }}
            aria-describedby={`${searchId}-hint`}
            className="h-12 rounded-lg bg-card pl-11 pr-20 text-base shadow-sm"
          />
          <p id={`${searchId}-hint`} className="sr-only">
            Searches {formatCount(initialPage.total)} papers by name, subject and course code.
            Results update as you type. Press Escape to clear.
          </p>
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {showSpinner && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
            {searchInput ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="h-9 w-9 text-muted-foreground"
                aria-label="Clear search"
              >
                <X aria-hidden="true" />
              </Button>
            ) : (
              <kbd
                className="mr-1 hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline-block"
                aria-hidden="true"
              >
                /
              </kbd>
            )}
          </div>
        </div>

        <Filters
          options={options}
          activeFilters={query.filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoadingOptions}
        />

        <ActiveFilters
          filters={query.filters}
          search={query.search}
          onClearFilter={handleClearFilter}
          onClearSearch={handleClearSearch}
          onClearAll={handleReset}
        />
      </section>

      <section
        ref={resultsRef}
        aria-labelledby="results-heading"
        aria-busy={isLoadingPapers}
        className="scroll-mt-6"
      >
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3">
          <h2 id="results-heading" className="text-sm font-medium" aria-live="polite">
            {error
              ? 'Results unavailable'
              : isLoadingPapers
                ? 'Loading papers…'
                : `${formatCount(data.total)} ${data.total === 1 ? 'paper' : 'papers'}`}
          </h2>
          {!error && data.totalPages > 1 && (
            <p className="text-xs text-muted-foreground">
              Page {data.page} of {formatCount(data.totalPages)}
            </p>
          )}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Could not load papers</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap items-center gap-3">
              <span>{error} Please try again in a moment.</span>
              <Button size="sm" variant="outline" onClick={() => setReloadToken((n) => n + 1)}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : isLoadingPapers && data.results.length === 0 ? (
          <PaperListSkeleton />
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
            <SearchX className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No papers match your search</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Check the spelling, try a course code instead of a name, or remove a filter.
            </p>
            <Button variant="outline" size="sm" className="mt-5" onClick={handleReset}>
              Clear search and filters
            </Button>
          </div>
        ) : (
          <div
            className={
              isLoadingPapers ? 'opacity-50 transition-opacity' : 'opacity-100 transition-opacity'
            }
          >
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
    </>
  );
}
