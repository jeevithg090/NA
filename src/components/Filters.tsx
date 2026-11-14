'use client';

import { useId } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ALL,
  FILTER_LABELS,
  FILTER_LEVELS,
  type ActiveFilters,
  type FilterLevel,
  type FilterOptions,
} from '@/lib/papers/filters';
import { cn } from '@/lib/utils';

interface FiltersProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (level: FilterLevel, value: string) => void;
  isLoading: boolean;
}

export function Filters({ options, activeFilters, onFilterChange, isLoading }: FiltersProps) {
  const baseId = useId();

  return (
    <fieldset aria-busy={isLoading} className="min-w-0">
      <legend className="sr-only">Filter papers</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FILTER_LEVELS.map((level) => {
          const { label, all } = FILTER_LABELS[level];
          const id = `${baseId}-${level}`;
          const value = activeFilters[level];
          const levelOptions = options[level];
          // Keep the current selection listed even if it has dropped out of the options.
          const values =
            value !== ALL && !levelOptions.includes(value)
              ? [value, ...levelOptions]
              : levelOptions;

          return (
            <div
              key={level}
              className={cn(
                'min-w-0 space-y-1.5',
                level === 'branch' && 'col-span-2 sm:col-span-1',
              )}
            >
              <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
                {label}
              </label>
              <Select value={value} onValueChange={(next) => onFilterChange(level, next)}>
                <SelectTrigger
                  id={id}
                  className={cn(
                    'h-10 w-full bg-card text-sm',
                    value !== ALL && 'border-primary/70 font-medium',
                  )}
                >
                  <SelectValue placeholder={all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{all}</SelectItem>
                  {values.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                  {values.length === 0 && (
                    <SelectItem value="__none" disabled>
                      {isLoading ? 'Loading…' : 'No options for this selection'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
