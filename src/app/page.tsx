import { PageShell } from '@/components/PageShell';
import { PapersPleaseClient } from '@/components/PapersPleaseClient';
import { DEFAULT_PAGE_SIZE } from '@/lib/papers/filters';
import { getPapers } from '@/lib/papers/loader';
import { getAllFilterOptions, queryPapers } from '@/lib/papers/query';

export default async function Home() {
  const papers = await getPapers();
  const initialOptions = getAllFilterOptions(papers);
  const initialPage = queryPapers(papers, {
    filters: {},
    search: '',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return (
    <PageShell>
      <PapersPleaseClient initialOptions={initialOptions} initialPage={initialPage} />
    </PageShell>
  );
}
