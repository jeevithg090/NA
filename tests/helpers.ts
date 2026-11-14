import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { processRawPapers } from '@/lib/papers/metadata';

export const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/papers.json', import.meta.url));

export function loadFixturePapers() {
  return processRawPapers(JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'))).papers;
}
