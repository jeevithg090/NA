import { describe, expect, it } from 'vitest';
import { setFilterCascading, emptyFilters } from '@/lib/papers/filters';
import {
  filterPapers,
  getAllFilterOptions,
  getFilterOptions,
  paginate,
  parsePapersQuery,
  parsePositiveInt,
  queryPapers,
  searchPapers,
} from '@/lib/papers/query';
import { buildFilterParams } from '@/lib/api/client';
import { loadFixturePapers } from './helpers';

const papers = loadFixturePapers();

describe('parsePositiveInt', () => {
  it.each([
    ['3', 3],
    [' 7 ', 7],
    ['0', 1],
    ['-2', 1],
    ['abc', 1],
    ['2.5', 1],
    ['', 1],
    [null, 1],
    ['99999999999999999999', 1],
  ])('parses %j as %j (fallback 1)', (input, expected) => {
    expect(parsePositiveInt(input, 1)).toBe(expected);
  });
});

describe('parsePapersQuery', () => {
  it('applies defaults and clamps the page size', () => {
    expect(parsePapersQuery(new URLSearchParams('page=abc&pageSize=1000'))).toEqual({
      filters: {},
      search: '',
      page: 1,
      pageSize: 100,
    });
  });

  it('reads filters, ignoring "all" and blanks, and trims the search', () => {
    const query = parsePapersQuery(
      new URLSearchParams('year=2023&branch=all&term=&search=%20maths%20&page=2&pageSize=10'),
    );
    expect(query).toEqual({ filters: { year: '2023' }, search: 'maths', page: 2, pageSize: 10 });
  });

  it('caps very long search strings', () => {
    const query = parsePapersQuery(new URLSearchParams({ search: 'a'.repeat(500) }));
    expect(query.search).toHaveLength(200);
  });
});

describe('filterPapers / searchPapers', () => {
  it('combines filters with AND semantics', () => {
    const result = filterPapers(papers, { year: '2023', branch: 'CSE' });
    expect(result.map((p) => p.subject)).toEqual(['Data Structures', 'Engineering Mathematics II']);
  });

  it('can skip one level (used for faceted options)', () => {
    expect(filterPapers(papers, { year: '2022', branch: 'CSE' }, 'branch')).toHaveLength(2);
  });

  it('searches name and subject case-insensitively', () => {
    expect(searchPapers(papers, 'DATA struct').map((p) => p.subject)).toEqual(['Data Structures']);
    expect(searchPapers(papers, 'cse 5101')).toHaveLength(1);
    expect(searchPapers(papers, '   ')).toHaveLength(papers.length);
  });
});

describe('paginate / queryPapers', () => {
  it('slices pages and reports at least one page', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({ totalPages: 3, results: [3, 4] });
    expect(paginate([], 1, 10)).toEqual({ totalPages: 1, results: [] });
  });

  it('returns totals for the filtered set, not the page', () => {
    const page = queryPapers(papers, {
      filters: { year: '2023' },
      search: '',
      page: 2,
      pageSize: 2,
    });
    expect(page).toMatchObject({ total: 3, page: 2, pageSize: 2, totalPages: 2 });
    expect(page.results).toHaveLength(1);
  });
});

describe('getFilterOptions', () => {
  it('returns sorted distinct values', () => {
    expect(getFilterOptions(papers, 'year')).toEqual(['2023', '2022']);
    expect(getFilterOptions(papers, 'branch')).toEqual(['CSE', 'ECE', 'Mech']);
  });

  it('narrows by the other selected filters but not its own', () => {
    expect(getFilterOptions(papers, 'branch', { year: '2022', branch: 'ECE' })).toEqual([
      'CSE',
      'ECE',
    ]);
    expect(getFilterOptions(papers, 'semester', { year: '2023' })).toEqual(['II Sem', 'IV Sem']);
  });

  it('builds options for every level', () => {
    expect(Object.keys(getAllFilterOptions(papers))).toEqual([
      'year',
      'programme',
      'term',
      'semester',
      'branch',
    ]);
  });
});

describe('setFilterCascading', () => {
  it('resets every filter below the one that changed', () => {
    const start = { ...emptyFilters(), year: '2023', term: 'June 2023', branch: 'CSE' };
    expect(setFilterCascading(start, 'programme', 'B.Tech')).toEqual({
      year: '2023',
      programme: 'B.Tech',
      term: 'all',
      semester: 'all',
      branch: 'all',
    });
  });
});

describe('buildFilterParams', () => {
  it('omits unset levels and the excluded level', () => {
    const params = buildFilterParams({ ...emptyFilters(), year: '2023', branch: 'CSE' }, 'branch');
    expect(params.toString()).toBe('year=2023');
  });
});
