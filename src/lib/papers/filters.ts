/**
 * Filter definitions shared by the API routes, the server loader and the client UI.
 * This module must stay free of Node-only imports so it can be bundled for the browser.
 */

export const FILTER_LEVELS = ['year', 'programme', 'term', 'semester', 'branch'] as const;

export type FilterLevel = (typeof FILTER_LEVELS)[number];

/** Sentinel used by the UI (and accepted by the API) to mean "no filter". */
export const ALL = 'all';

export type ActiveFilters = Record<FilterLevel, string>;

export type FilterOptions = Record<FilterLevel, string[]>;

export const FILTER_LABELS: Record<FilterLevel, { label: string; all: string }> = {
  year: { label: 'Year', all: 'All Years' },
  programme: { label: 'Programme', all: 'All Programmes' },
  term: { label: 'Term', all: 'All Terms' },
  semester: { label: 'Semester', all: 'All Semesters' },
  branch: { label: 'Branch', all: 'All Branches' },
};

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;
export const MAX_SEARCH_LENGTH = 200;

export function isFilterLevel(value: unknown): value is FilterLevel {
  return typeof value === 'string' && (FILTER_LEVELS as readonly string[]).includes(value);
}

export function emptyFilters(): ActiveFilters {
  return { year: ALL, programme: ALL, term: ALL, semester: ALL, branch: ALL };
}

/**
 * Returns a copy of `filters` with `level` set to `value` and every level after it
 * (in hierarchy order) reset, since narrower selections may no longer be valid.
 */
export function setFilterCascading(
  filters: ActiveFilters,
  level: FilterLevel,
  value: string,
): ActiveFilters {
  const next = { ...filters, [level]: value };
  const index = FILTER_LEVELS.indexOf(level);
  for (const downstream of FILTER_LEVELS.slice(index + 1)) {
    next[downstream] = ALL;
  }
  return next;
}
