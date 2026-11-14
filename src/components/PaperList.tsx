'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Paper } from '@/types/paper';

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3';

function Meta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
      <Icon className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      {value}
    </li>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border bg-card p-4 transition-[border-color,box-shadow,transform] duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/40 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md motion-reduce:hover:translate-y-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug">
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none group-hover:text-primary"
            >
              {paper.name}
              <span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>
          </h3>
          {/* The subject is derived from the start of the name, so it is only shown when it adds something. */}
          {paper.subject && !paper.name.toLowerCase().startsWith(paper.subject.toLowerCase()) && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              <span className="sr-only">Subject: </span>
              {paper.subject}
            </p>
          )}
        </div>
        <ExternalLink
          className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      <ul className="mt-4 flex flex-wrap gap-1.5 pl-11">
        <Meta icon={Calendar} label="Year" value={paper.year} />
        <Meta icon={Clock} label="Term" value={paper.term} />
        {paper.programme && <Meta icon={GraduationCap} label="Programme" value={paper.programme} />}
        {paper.semester && <Meta icon={BookOpen} label="Semester" value={paper.semester} />}
        {paper.branch && <Meta icon={GitBranch} label="Branch" value={paper.branch} />}
      </ul>
    </article>
  );
}

export function PaperList({ papers }: { papers: Paper[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      // Re-run the entrance animation whenever a new result set arrives.
      key={papers[0]?.id ?? 'empty'}
      className={GRID}
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.02 } } }}
    >
      {papers.map((paper) => (
        <motion.li
          key={paper.id}
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
          }}
        >
          <PaperCard paper={paper} />
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function PaperListSkeleton({ count = 9 }: { count?: number }) {
  return (
    <ul className={GRID} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="rounded-lg border bg-card p-4">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-4 flex gap-1.5 pl-11">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        </li>
      ))}
    </ul>
  );
}
