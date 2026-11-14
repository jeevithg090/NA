import { NextResponse } from 'next/server';
import { getPapers } from '@/lib/papers/loader';
import { parsePapersQuery, queryPapers } from '@/lib/papers/query';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const query = parsePapersQuery(new URL(request.url).searchParams);
  try {
    const papers = await getPapers();
    return NextResponse.json(queryPapers(papers, query));
  } catch (error) {
    console.error('[api/papers] Failed to load papers:', error);
    return NextResponse.json({ error: 'Failed to load papers.' }, { status: 500 });
  }
}
