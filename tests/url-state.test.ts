import { describe, expect, it } from 'vitest';
import { emptyFilters } from '@/lib/papers/filters';
import { isDefaultState, parseUrlState, serializeUrlState } from '@/lib/papers/url-state';

describe('URL state', () => {
  it('round-trips search, filters and page', () => {
    const state = {
      filters: { ...emptyFilters(), year: '2023', semester: 'IV Sem' },
      search: 'data structures',
      page: 3,
    };
    const query = serializeUrlState(state);
    expect(query).toBe('?q=data+structures&year=2023&semester=IV+Sem&page=3');
    expect(parseUrlState(query)).toEqual(state);
  });

  it('omits defaults so the base URL stays clean', () => {
    expect(serializeUrlState({ filters: emptyFilters(), search: '  ', page: 1 })).toBe('');
  });

  it('ignores unknown keys and malformed pages', () => {
    const state = parseUrlState('?foo=bar&page=-4&branch=%20CSE%20');
    expect(state).toEqual({ filters: { ...emptyFilters(), branch: 'CSE' }, search: '', page: 1 });
  });

  it('detects the default state', () => {
    expect(isDefaultState(parseUrlState(''))).toBe(true);
    expect(isDefaultState(parseUrlState('?page=2'))).toBe(false);
    expect(isDefaultState(parseUrlState('?q=x'))).toBe(false);
  });
});
