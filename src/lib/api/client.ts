import type { PapersPage, SelectedFilters } from '@/lib/papers/query';
import { ALL, FILTER_LEVELS, type FilterLevel } from '@/lib/papers/filters';

/** Builds a query string from the selected filters, omitting unset (`all`) levels. */
export function buildFilterParams(
  filters: SelectedFilters,
  exclude?: FilterLevel,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const level of FILTER_LEVELS) {
    const value = filters[level];
    if (level !== exclude && value && value !== ALL) params.set(level, value);
  }
  return params;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText}).`);
  }
  return (await response.json()) as T;
}

export interface FetchPapersArgs {
  filters: SelectedFilters;
  search: string;
  page: number;
  pageSize: number;
}

export function fetchPapers(
  { filters, search, page, pageSize }: FetchPapersArgs,
  signal?: AbortSignal,
): Promise<PapersPage> {
  const params = buildFilterParams(filters);
  if (search.trim()) params.set('search', search.trim());
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return getJson<PapersPage>(`/api/papers?${params}`, signal);
}

export async function fetchFilterOptions(
  level: FilterLevel,
  filters: SelectedFilters,
  signal?: AbortSignal,
): Promise<string[]> {
  const params = buildFilterParams(filters, level);
  params.set('level', level);
  const data = await getJson<{ options: string[] }>(`/api/filter-options?${params}`, signal);
  return Array.isArray(data.options) ? data.options : [];
}
