import type { Paper } from '@/types/paper';
import {
  ALL,
  DEFAULT_PAGE_SIZE,
  FILTER_LEVELS,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  type FilterLevel,
  type FilterOptions,
} from './filters';
import { sortFilterOptions } from './sort';

export type SelectedFilters = Partial<Record<FilterLevel, string>>;

export interface PapersQuery {
  filters: SelectedFilters;
  search: string;
  page: number;
  pageSize: number;
}

export interface PapersPage {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: Paper[];
}

/** Parses a positive integer, falling back when the value is missing or malformed. */
export function parsePositiveInt(value: string | null | undefined, fallback: number): number {
  if (value == null || !/^\s*\d+\s*$/.test(value)) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isSafeInteger(n) && n >= 1 ? n : fallback;
}

/** Reads the filter values from URL search params, ignoring empty and `all` values. */
export function parseFilters(params: URLSearchParams): SelectedFilters {
  const filters: SelectedFilters = {};
  for (const level of FILTER_LEVELS) {
    const value = params.get(level)?.trim();
    if (value && value !== ALL) filters[level] = value;
  }
  return filters;
}

export function parsePapersQuery(params: URLSearchParams): PapersQuery {
  return {
    filters: parseFilters(params),
    search: (params.get('search') ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    page: parsePositiveInt(params.get('page'), 1),
    pageSize: Math.min(MAX_PAGE_SIZE, parsePositiveInt(params.get('pageSize'), DEFAULT_PAGE_SIZE)),
  };
}

/** Applies the selected filters, optionally skipping one level (used for faceted options). */
export function filterPapers(
  papers: readonly Paper[],
  filters: SelectedFilters,
  skipLevel?: FilterLevel,
): Paper[] {
  const active = FILTER_LEVELS.filter(
    (level) => level !== skipLevel && filters[level] && filters[level] !== ALL,
  );
  if (active.length === 0) return papers.slice();
  return papers.filter((paper) => active.every((level) => paper[level] === filters[level]));
}

/** Case-insensitive substring search on paper name and subject. */
export function searchPapers(papers: readonly Paper[], search: string): Paper[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return papers.slice();
  return papers.filter(
    (paper) =>
      paper.name.toLowerCase().includes(needle) ||
      (paper.subject?.toLowerCase().includes(needle) ?? false),
  );
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  return { totalPages, results: items.slice(start, start + pageSize) };
}

export function queryPapers(papers: readonly Paper[], query: PapersQuery): PapersPage {
  const matching = searchPapers(filterPapers(papers, query.filters), query.search);
  const { totalPages, results } = paginate(matching, query.page, query.pageSize);
  return {
    total: matching.length,
    page: query.page,
    pageSize: query.pageSize,
    totalPages,
    results,
  };
}

/**
 * Distinct values available for `level`, given every *other* selected filter.
 * Ignoring the level's own selection lets the user switch to a sibling value.
 */
export function getFilterOptions(
  papers: readonly Paper[],
  level: FilterLevel,
  filters: SelectedFilters = {},
): string[] {
  const values = new Set<string>();
  for (const paper of filterPapers(papers, filters, level)) {
    const value = paper[level];
    if (value) values.add(value);
  }
  return sortFilterOptions(level, values);
}

export function getAllFilterOptions(
  papers: readonly Paper[],
  filters: SelectedFilters = {},
): FilterOptions {
  return Object.fromEntries(
    FILTER_LEVELS.map((level) => [level, getFilterOptions(papers, level, filters)]),
  ) as FilterOptions;
}
