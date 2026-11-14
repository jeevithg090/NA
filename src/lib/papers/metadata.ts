import type { Paper, RawPaper } from '@/types/paper';
import { comparePapers } from './sort';

/** URL fragments of library-portal documents that are not question papers. */
const IGNORED_URL_PATTERNS = [
  '/Publication%20List',
  '/Policy%20Rules',
  '/Plagarisim',
  '/Membership/',
  '/Open%20Access/',
  'Certificate%20format',
];

/** File-name keywords of documents that are not question papers. */
const IGNORED_NAME_KEYWORDS = [
  'policy',
  'publication',
  'membership',
  'plagiarism',
  'certificate',
  'rules',
  'regulations',
  'guidelines',
  'format',
  'sop',
];

const KNOWN_BRANCHES = [
  'Aeronautical',
  'Automobile',
  'Biomedical',
  'Biotechnology',
  'Chemical',
  'Civil',
  'Computer & Communication',
  'Computer Science',
  'Electrical & Electronics',
  'Electronics & Communication',
  'Industrial & Production',
  'Information Technology',
  'Instrumentation & Control',
  'Mechanical',
  'Mechatronics',
  'Printing & Media',
];

/** Collapses the many spellings of a branch folder into one canonical label. */
export function normalizeBranch(branch: string | undefined): string | undefined {
  if (!branch) return undefined;
  const b = branch.toLowerCase().trim();
  if (!b) return undefined;

  if (b.includes('electrical') && b.includes('electronic')) return 'EEE';
  if (b.includes('electronic') && b.includes('communication')) return 'ECE';
  if (b.includes('computer') && b.includes('science')) return 'CSE';
  if (b.includes('information') && b.includes('tech')) return 'IT';
  if (b.includes('mechatronic')) return 'Mechatronics';
  if (b.includes('mech')) return 'Mech';
  if (b.includes('aero')) return 'Aero';
  if (b.includes('civil')) return 'Civil';
  if (b.includes('chem')) return 'Chemical';
  if (b.includes('bio') && b.includes('tech')) return 'Biotech';
  if (b.includes('industr') && b.includes('prod')) return 'Industrial & Production Engg';
  if (b.includes('architec')) return 'Architecture Engg';
  if (b.includes('automobile')) return 'Automobile Engg';
  if (b.includes('instrumentation') && b.includes('control'))
    return 'Instrumentation & Control Engg';
  if (b.includes('print') && b.includes('media')) return 'Printing & Media Engg';

  const withoutSuffix = b.replace(/ engg| engineering/g, '');
  const known = KNOWN_BRANCHES.find((k) => k.toLowerCase() === withoutSuffix);
  if (known) return known;

  return branch
    .trim()
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const EXAM_TYPE_WORDS =
  /\b(mid sem|midterm|end sem|endterm|final|sessional|make up|makeup|quiz|test|exam|paper)\b/gi;
const SEMESTER_PATTERN = /\b(VIII|VII|VI|V|IV|III|II|I)\s*Sem\b/i;
const COURSE_CODE_PATTERN = /[([]\s*[A-Z]{2,}[-\s]?\d{3,}\s*[)\]]/;

const collapseSpaces = (s: string) => s.replace(/\s{2,}/g, ' ').trim();

/** Cleans a raw file name into a display name (drops `.pdf`, exam-type words and empty brackets). */
export function cleanPaperName(rawName: string): string {
  return collapseSpaces(
    rawName
      .replace(/\.pdf$/i, '')
      .replace(EXAM_TYPE_WORDS, '')
      // Brackets emptied by the step above, e.g. "Maths (MAT 1271)(Exam)" → "Maths (MAT 1271)()".
      .replace(/\(\s*\)|\[\s*\]/g, ' '),
  );
}

/**
 * Infers a subject from a cleaned paper name: the text before any course code,
 * parenthesis or bracket. Returns `undefined` when nothing meaningful remains.
 */
export function deriveSubject(name: string): string | undefined {
  const codeIndex = name.search(COURSE_CODE_PATTERN);
  const separatorIndex = codeIndex >= 0 ? codeIndex : name.search(/[([]/);
  const head = separatorIndex > 0 ? name.slice(0, separatorIndex) : name;

  const subject = collapseSpaces(
    head
      .trim()
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*\)/g, '')
      .replace(/[-_]+$/, '')
      .replace(/[()[\]]/g, ''),
  );

  const isJustCode = /^\s*([A-Z]{2,}[-\s]?\d{3,}\s*)+$/.test(subject);
  const isGeneric = /^rcs$/i.test(subject);
  if (!subject || isJustCode || isGeneric || subject.length <= 3) return undefined;
  if (subject.toLowerCase() === name.toLowerCase()) return undefined;
  return subject;
}

export type PaperMetadata = Omit<Paper, 'id' | 'url' | 'path'>;

/**
 * Derives year, term, programme, semester, branch, name and subject from a paper's
 * folder path and file name. Returns `null` if the entry does not look like a paper.
 *
 * Expected path shape: `[year, term, ...segments]`, where segments may include a
 * programme (`B.Tech`/`M.Tech`), a semester (`IV Sem`) and one or more branch folders.
 */
export function deriveMetadata(filePath: string[], rawName: string): PaperMetadata | null {
  if (!Array.isArray(filePath) || filePath.length < 2) return null;

  const year = filePath[0]?.trim();
  if (!year || !/^\d{4}$/.test(year)) return null;

  const term = filePath[1] ? collapseSpaces(filePath[1]) : '';
  if (term.length < 3) return null;

  let semester: string | undefined;
  let programme: string | undefined;
  const branchCandidates: string[] = [];

  for (const segment of filePath.slice(2)) {
    const element = segment?.trim();
    if (!element) continue;
    const lower = element.toLowerCase();

    const semMatch = element.match(SEMESTER_PATTERN);
    if (semMatch && !semester) {
      semester = `${semMatch[1].toUpperCase()} Sem`;
      continue;
    }
    if (lower.includes('m.tech') || lower.includes('m tech')) {
      programme ??= 'M.Tech';
      continue;
    }
    if (lower.includes('b.tech') || lower.includes('b tech')) {
      programme ??= 'B.Tech';
      continue;
    }
    branchCandidates.push(element);
  }

  // Semester-organised folders without an explicit programme are undergraduate.
  if (!programme && semester) programme = 'B.Tech';

  let branch: string | undefined;
  if (branchCandidates.length > 0) {
    const last = branchCandidates[branchCandidates.length - 1];
    branch = last.toUpperCase() === 'CSE' ? 'CSE' : normalizeBranch(last);

    if ((!branch || branch.toUpperCase() === 'SEM') && branchCandidates.length > 1) {
      const previous = normalizeBranch(branchCandidates[branchCandidates.length - 2]);
      if (previous && previous !== branch) branch = previous;
    }
  }

  const name = cleanPaperName(rawName ?? '');
  if (!name) return null;

  const metadata: PaperMetadata = { year, term, name };
  if (programme) metadata.programme = programme;
  if (semester) metadata.semester = semester;
  if (branch) metadata.branch = branch;
  const subject = deriveSubject(name);
  if (subject) metadata.subject = subject;
  return metadata;
}

/** Whether a raw entry is a non-paper document (policy, membership form, …) or unusable. */
export function isIgnoredEntry(raw: RawPaper): boolean {
  if (!raw.url || !/^https?:\/\//i.test(raw.url)) return true;
  if (IGNORED_URL_PATTERNS.some((pattern) => raw.url.includes(pattern))) return true;

  const name = raw.name?.trim() ?? '';
  if (!name || name.toLowerCase() === '.pdf') return true;
  const lower = name.toLowerCase();
  if (IGNORED_NAME_KEYWORDS.some((keyword) => lower.includes(keyword))) return true;

  return !Array.isArray(raw.path) || raw.path.length < 2;
}

function isRawPaper(value: unknown): value is RawPaper {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.url === 'string' && typeof v.name === 'string' && Array.isArray(v.path);
}

export interface ProcessResult {
  papers: Paper[];
  skipped: number;
}

/** Validates, filters, enriches and sorts raw scraped entries. */
export function processRawPapers(raw: unknown): ProcessResult {
  if (!Array.isArray(raw)) return { papers: [], skipped: 0 };

  const papers: Paper[] = [];
  let skipped = 0;

  for (const entry of raw) {
    if (!isRawPaper(entry) || isIgnoredEntry(entry)) {
      skipped++;
      continue;
    }
    const metadata = deriveMetadata(entry.path, entry.name);
    if (!metadata) {
      skipped++;
      continue;
    }
    papers.push({
      ...metadata,
      path: entry.path,
      url: entry.url,
      id: `paper-${papers.length + 1}`,
    });
  }

  papers.sort(comparePapers);
  return { papers, skipped };
}
