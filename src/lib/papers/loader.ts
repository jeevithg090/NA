import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Paper } from '@/types/paper';
import { processRawPapers } from './metadata';

/** Path to the scraped dataset. Override with `PAPERS_DATA_FILE` (absolute or relative to cwd). */
export function getDataFilePath(): string {
  const configured = process.env.PAPERS_DATA_FILE?.trim();
  return path.resolve(process.cwd(), configured || path.join('data', 'all_papers.json'));
}

async function loadPapers(): Promise<Paper[]> {
  const file = getDataFilePath();
  const contents = await readFile(file, 'utf8');
  const { papers, skipped } = processRawPapers(JSON.parse(contents));
  console.info(
    `[papers] Loaded ${papers.length} papers from ${file} (skipped ${skipped} entries).`,
  );
  return papers;
}

let papersPromise: Promise<Paper[]> | null = null;

/**
 * Returns the processed dataset. The file is static for the lifetime of the process,
 * so it is parsed once and shared; concurrent callers await the same promise.
 * A failed load is not cached, so the next request retries.
 */
export function getPapers(): Promise<readonly Paper[]> {
  if (!papersPromise) {
    papersPromise = loadPapers().catch((error: unknown) => {
      papersPromise = null;
      throw error;
    });
  }
  return papersPromise;
}
