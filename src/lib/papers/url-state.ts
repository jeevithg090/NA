import { ALL, FILTER_LEVELS, MAX_SEARCH_LENGTH, emptyFilters, type ActiveFilters } from './filters';
import { parsePositiveInt } from './query';

export interface UrlState {
  filters: ActiveFilters;
  search: string;
  page: number;
}

/** Reads search, filters and page from a URL query string (unknown keys are ignored). */
export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search);
  const filters = emptyFilters();
  for (const level of FILTER_LEVELS) {
    const value = params.get(level)?.trim();
    if (value) filters[level] = value;
  }
  return {
    filters,
    search: (params.get('q') ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    page: parsePositiveInt(params.get('page'), 1),
  };
}

/** Serialises state to a query string, omitting defaults so the base URL stays clean. */
export function serializeUrlState({ filters, search, page }: UrlState): string {
  const params = new URLSearchParams();
  if (search.trim()) params.set('q', search.trim());
  for (const level of FILTER_LEVELS) {
    if (filters[level] && filters[level] !== ALL) params.set(level, filters[level]);
  }
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function isDefaultState({ filters, search, page }: UrlState): boolean {
  return page === 1 && !search && FILTER_LEVELS.every((level) => filters[level] === ALL);
}
