import { NextResponse } from 'next/server';
import { FILTER_LEVELS, isFilterLevel } from '@/lib/papers/filters';
import { getPapers } from '@/lib/papers/loader';
import { getFilterOptions, parseFilters } from '@/lib/papers/query';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const level = params.get('level');

  if (!isFilterLevel(level)) {
    return NextResponse.json(
      { error: `Invalid or missing "level". Expected one of: ${FILTER_LEVELS.join(', ')}.` },
      { status: 400 },
    );
  }

  try {
    const papers = await getPapers();
    return NextResponse.json({ options: getFilterOptions(papers, level, parseFilters(params)) });
  } catch (error) {
    console.error('[api/filter-options] Failed to load papers:', error);
    return NextResponse.json({ error: 'Failed to load filter options.' }, { status: 500 });
  }
}
