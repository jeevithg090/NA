import { describe, expect, it } from 'vitest';
import {
  cleanPaperName,
  deriveMetadata,
  deriveSubject,
  isIgnoredEntry,
  normalizeBranch,
  processRawPapers,
} from '@/lib/papers/metadata';
import { loadFixturePapers } from './helpers';

describe('normalizeBranch', () => {
  it.each([
    ['Computer Science', 'CSE'],
    ['computer science engg', 'CSE'],
    ['Electrical & Electronics', 'EEE'],
    ['Electronics & Communication', 'ECE'],
    ['Information Technology', 'IT'],
    ['Mechanical', 'Mech'],
    ['Mechatronics', 'Mechatronics'],
    ['Biotechnology Eng', 'Biotech'],
    ['Aeronautical', 'Aero'],
    ['Instrumentation and Control', 'Instrumentation & Control Engg'],
    ['Biomedical Engineering', 'Biomedical'],
    ['physics', 'Physics'],
    ['data-science lab', 'Data Science Lab'],
    ['Cce', 'CCE'],
    ['it', 'IT'],
    ['VLSI', 'VLSI'],
    ['E & C', 'ECE'],
    ['E and E', 'EEE'],
    ['EC', 'ECE'],
    ['Maths', 'Maths'],
  ])('normalises %j to %j', (input, expected) => {
    expect(normalizeBranch(input)).toBe(expected);
  });

  it('returns undefined for empty input', () => {
    expect(normalizeBranch(undefined)).toBeUndefined();
    expect(normalizeBranch('   ')).toBeUndefined();
  });
});

describe('cleanPaperName', () => {
  it('drops the extension and exam-type words', () => {
    expect(cleanPaperName('Thermodynamics End Sem.pdf')).toBe('Thermodynamics');
    expect(cleanPaperName('Signals  (ECE 2152) MakeUp.PDF')).toBe('Signals (ECE 2152)');
    expect(cleanPaperName('Fluid Mechanics Makeup Exam.pdf')).toBe('Fluid Mechanics');
    expect(cleanPaperName('Engineering Mathematics II (MAT 1271)().pdf')).toBe(
      'Engineering Mathematics II (MAT 1271)',
    );
    expect(cleanPaperName('Chemistry [ ] (Exam).pdf')).toBe('Chemistry');
  });
});

describe('deriveSubject', () => {
  it('takes the text before a course code', () => {
    expect(deriveSubject('Data Structures (CSE 2152)')).toBe('Data Structures');
    expect(deriveSubject('Design of Aircraft Structure- (AAE 342)')).toBe(
      'Design of Aircraft Structure',
    );
  });

  it('ignores names that are only a code, too short, or identical to the name', () => {
    expect(deriveSubject('(CSE 2152)')).toBeUndefined();
    expect(deriveSubject('OS (CSE 2152)')).toBeUndefined();
    expect(deriveSubject('Thermodynamics')).toBeUndefined();
    expect(deriveSubject('RCS (PHY 1001)')).toBeUndefined();
  });
});

describe('deriveMetadata', () => {
  it('extracts year, term, semester, branch and an implied B.Tech programme', () => {
    expect(
      deriveMetadata(['2023', 'June  2023', 'IV Sem', 'Computer Science'], 'DS (CSE 2152).pdf'),
    ).toEqual({
      year: '2023',
      term: 'June 2023',
      semester: 'IV Sem',
      programme: 'B.Tech',
      branch: 'CSE',
      name: 'DS (CSE 2152)',
    });
  });

  it('detects explicit programmes and normalises semester casing', () => {
    const meta = deriveMetadata(['2022', 'Dec 2022', 'M.Tech', 'ii sem', 'CSE'], 'Algo.pdf');
    expect(meta).toMatchObject({ programme: 'M.Tech', semester: 'II Sem', branch: 'CSE' });
  });

  it('rejects malformed paths and names', () => {
    expect(deriveMetadata(['2022'], 'x.pdf')).toBeNull();
    expect(deriveMetadata(['22', 'June 2022'], 'x.pdf')).toBeNull();
    expect(deriveMetadata(['2022', 'Ju'], 'x.pdf')).toBeNull();
    expect(deriveMetadata(['2022', 'June 2022'], 'Exam.pdf')).toBeNull();
  });
});

describe('isIgnoredEntry', () => {
  const base = { path: ['2023', 'June 2023'], name: 'Maths.pdf', url: 'https://x.edu/a.pdf' };

  it('keeps ordinary papers', () => {
    expect(isIgnoredEntry(base)).toBe(false);
  });

  it.each([
    ['non-http URL', { url: 'javascript:alert(1)' }],
    ['library admin URL', { url: 'https://x.edu/MIT/Membership/Student.pdf' }],
    ['policy document', { name: 'Library Policy.pdf' }],
    ['empty name', { name: '  ' }],
    ['bare extension', { name: '.pdf' }],
    ['short path', { path: ['2023'] }],
  ])('drops entries with a %s', (_label, override) => {
    expect(isIgnoredEntry({ ...base, ...override })).toBe(true);
  });
});

describe('processRawPapers', () => {
  it('returns an empty result for non-array input', () => {
    expect(processRawPapers({ not: 'an array' })).toEqual({ papers: [], skipped: 0 });
  });

  it('skips invalid entries and assigns unique ids', () => {
    const { papers, skipped } = processRawPapers([
      { path: ['2023', 'June 2023'], name: 'A.pdf', url: 'https://x.edu/a.pdf' },
      { path: ['2023', 'June 2023'], name: 'B.pdf', url: 'https://x.edu/b.pdf' },
      { nonsense: true },
      null,
    ]);
    expect(skipped).toBe(2);
    expect(new Set(papers.map((p) => p.id)).size).toBe(2);
  });

  it('sorts newest year first, then term, programme, semester and branch', () => {
    const papers = loadFixturePapers();
    expect(papers.map((p) => [p.year, p.term, p.programme, p.semester, p.branch])).toEqual([
      ['2023', 'June 2023', 'B.Tech', 'IV Sem', 'CSE'],
      ['2023', 'June 2023', 'B.Tech', 'IV Sem', 'Mech'],
      ['2023', 'Dec 2022 Jan 2023', 'B.Tech', 'II Sem', 'CSE'],
      ['2022', 'June 2022', 'B.Tech', 'VI Sem', 'ECE'],
      ['2022', 'June 2022', 'M.Tech', undefined, 'CSE'],
    ]);
  });
});
