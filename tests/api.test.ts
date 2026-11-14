import { beforeAll, describe, expect, it } from 'vitest';
import type * as FilterOptionsRoute from '@/app/api/filter-options/route';
import type * as PapersRoute from '@/app/api/papers/route';
import { FIXTURE_PATH } from './helpers';

// The loader reads PAPERS_DATA_FILE on first use, so the routes are imported after setting it.
let papersRoute: typeof PapersRoute;
let optionsRoute: typeof FilterOptionsRoute;

beforeAll(async () => {
  process.env.PAPERS_DATA_FILE = FIXTURE_PATH;
  papersRoute = await import('@/app/api/papers/route');
  optionsRoute = await import('@/app/api/filter-options/route');
});

const get = (path: string) => new Request(`http://localhost${path}`);

describe('GET /api/papers', () => {
  it('returns a paginated, filtered page', async () => {
    const response = await papersRoute.GET(get('/api/papers?year=2023&pageSize=2'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ total: 3, page: 1, pageSize: 2, totalPages: 2 });
    expect(body.results).toHaveLength(2);
    expect(body.results[0]).toHaveProperty('url');
  });

  it('tolerates malformed pagination parameters', async () => {
    const response = await papersRoute.GET(get('/api/papers?page=oops&pageSize=-5'));
    const body = await response.json();
    expect(body).toMatchObject({ page: 1, pageSize: 24, total: 5 });
  });
});

describe('GET /api/filter-options', () => {
  it('rejects a missing or unknown level', async () => {
    expect((await optionsRoute.GET(get('/api/filter-options'))).status).toBe(400);
    expect((await optionsRoute.GET(get('/api/filter-options?level=url'))).status).toBe(400);
  });

  it('returns options narrowed by the other filters', async () => {
    const response = await optionsRoute.GET(get('/api/filter-options?level=branch&year=2022'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ options: ['CSE', 'ECE'] });
  });
});
