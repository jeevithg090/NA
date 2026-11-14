'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Calendar, Clock, FileText, GitBranch, GraduationCap, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paper } from '@/types/paper';

interface PaperListProps {
  papers: Paper[];
}

function MetaBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-normal"
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      {value}
    </Badge>
  );
}

export function PaperList({ papers }: PaperListProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      // Re-run the entrance animation whenever a new result set arrives.
      key={papers[0]?.id ?? 'empty'}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
    >
      {papers.map((paper) => (
        <motion.li
          key={paper.id}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
          }}
        >
          <Card className="relative flex h-full flex-col rounded-lg border bg-card shadow-none transition-colors focus-within:border-primary/60 hover:border-primary/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-start gap-2 text-sm font-medium leading-snug">
                <FileText
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words after:absolute after:inset-0 after:content-[''] hover:text-primary hover:underline focus-visible:outline-none"
                >
                  {paper.name}
                  <span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
              </CardTitle>
              {paper.subject && (
                <CardDescription className="flex items-center gap-1.5 pl-[22px] pt-1 text-xs">
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only">Subject: </span>
                  {paper.subject}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-1">
              <div className="mt-1.5 flex flex-wrap gap-1.5 pl-[22px]">
                <MetaBadge icon={Calendar} label="Year" value={paper.year} />
                {paper.programme && (
                  <MetaBadge icon={GraduationCap} label="Programme" value={paper.programme} />
                )}
                <MetaBadge icon={Clock} label="Term" value={paper.term} />
                {paper.semester && (
                  <MetaBadge icon={BookOpen} label="Semester" value={paper.semester} />
                )}
                {paper.branch && <MetaBadge icon={GitBranch} label="Branch" value={paper.branch} />}
              </div>
            </CardContent>
          </Card>
        </motion.li>
      ))}
    </motion.ul>
  );
}
