import { describe, expect, it } from 'vitest';
import {
  getProgrammeSortOrder,
  getSemesterSortOrder,
  getTermSortOrder,
  sortFilterOptions,
} from '@/lib/papers/sort';

describe('sort orders', () => {
  it('orders terms summer → mid-term → winter → other', () => {
    expect(getTermSortOrder('May-June 2024')).toBe(1);
    expect(getTermSortOrder('Mid Sem 2024')).toBe(2);
    expect(getTermSortOrder('Dec 2023-Jan 2024')).toBe(3);
    expect(getTermSortOrder('Supplementary')).toBe(4);
    expect(getTermSortOrder(undefined)).toBe(99);
  });

  it('maps roman-numeral semesters to their number', () => {
    expect(['I Sem', 'II Sem', 'IV Sem', 'VIII Sem'].map(getSemesterSortOrder)).toEqual([
      1, 2, 4, 8,
    ]);
    expect(getSemesterSortOrder('Elective')).toBe(98);
    expect(getSemesterSortOrder(undefined)).toBe(99);
  });

  it('puts B.Tech before M.Tech before others', () => {
    expect(getProgrammeSortOrder('B.Tech')).toBeLessThan(getProgrammeSortOrder('M.Tech'));
    expect(getProgrammeSortOrder('M.Tech')).toBeLessThan(getProgrammeSortOrder('MCA'));
  });
});

describe('sortFilterOptions', () => {
  it('sorts years newest first', () => {
    expect(sortFilterOptions('year', ['2019', '2024', '2021'])).toEqual(['2024', '2021', '2019']);
  });

  it('sorts semesters numerically rather than alphabetically', () => {
    expect(sortFilterOptions('semester', ['V Sem', 'II Sem', 'IV Sem', 'I Sem'])).toEqual([
      'I Sem',
      'II Sem',
      'IV Sem',
      'V Sem',
    ]);
  });

  it('sorts branches alphabetically and does not mutate the input', () => {
    const input = ['Mech', 'CSE', 'ECE'];
    expect(sortFilterOptions('branch', input)).toEqual(['CSE', 'ECE', 'Mech']);
    expect(input).toEqual(['Mech', 'CSE', 'ECE']);
  });
});
