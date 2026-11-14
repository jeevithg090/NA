import type { Paper } from '@/types/paper';
import type { FilterLevel } from './filters';

const UNKNOWN = 99;

/** Orders terms within a year: summer (Apr–Jul) first, then mid-terms, then winter (Nov–Feb). */
export function getTermSortOrder(term: string | undefined): number {
  if (!term) return UNKNOWN;
  const t = term.toLowerCase();
  if (['may', 'jun', 'jul', 'apr'].some((m) => t.includes(m))) return 1;
  if (t.includes('mid')) return 2;
  if (['dec', 'nov', 'jan', 'feb'].some((m) => t.includes(m))) return 3;
  return 4;
}

const ROMAN_SEMESTERS: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
};

/** Maps `"IV Sem"` → 4. Unrecognised values sort after known semesters. */
export function getSemesterSortOrder(semester: string | undefined): number {
  if (!semester) return UNKNOWN;
  const match = semester.toUpperCase().match(/^(VIII|VII|VI|V|IV|III|II|I)(\s+SEM)?\b/);
  return match ? ROMAN_SEMESTERS[match[1]] : 98;
}

export function getProgrammeSortOrder(programme: string | undefined): number {
  if (!programme) return UNKNOWN;
  const p = programme.toUpperCase();
  if (p.includes('B.TECH')) return 1;
  if (p.includes('M.TECH')) return 2;
  return 50;
}

function byOrderThenAlpha(order: (value: string) => number) {
  return (a: string, b: string) => order(a) - order(b) || a.localeCompare(b);
}

const OPTION_COMPARATORS: Record<FilterLevel, (a: string, b: string) => number> = {
  year: (a, b) => Number(b) - Number(a) || b.localeCompare(a),
  programme: byOrderThenAlpha(getProgrammeSortOrder),
  term: byOrderThenAlpha(getTermSortOrder),
  semester: byOrderThenAlpha(getSemesterSortOrder),
  branch: (a, b) => a.localeCompare(b),
};

/** Sorts the distinct values of a filter level into display order (returns a new array). */
export function sortFilterOptions(level: FilterLevel, values: Iterable<string>): string[] {
  return Array.from(values).sort(OPTION_COMPARATORS[level]);
}

/** Compares optional strings so that present values sort before missing ones. */
function compareOptional(a: string | undefined, b: string | undefined): number {
  if (a && !b) return -1;
  if (!a && b) return 1;
  if (a && b) return a.localeCompare(b);
  return 0;
}

/** Year (newest first) › Term › Programme › Semester › Branch › Name. */
export function comparePapers(a: Paper, b: Paper): number {
  return (
    b.year.localeCompare(a.year) ||
    getTermSortOrder(a.term) - getTermSortOrder(b.term) ||
    a.term.localeCompare(b.term) ||
    getProgrammeSortOrder(a.programme) - getProgrammeSortOrder(b.programme) ||
    compareOptional(a.programme, b.programme) ||
    getSemesterSortOrder(a.semester) - getSemesterSortOrder(b.semester) ||
    compareOptional(a.semester, b.semester) ||
    compareOptional(a.branch, b.branch) ||
    a.name.localeCompare(b.name)
  );
}
