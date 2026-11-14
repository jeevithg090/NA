'use client';

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

interface FiltersProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (level: FilterLevel, value: string) => void;
  isLoading: boolean;
}

export function Filters({ options, activeFilters, onFilterChange, isLoading }: FiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filter papers"
      aria-busy={isLoading}
      className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 md:grid-cols-5"
    >
      {FILTER_LEVELS.map((level) => {
        const { label, all } = FILTER_LABELS[level];
        const levelOptions = options[level];
        const value = activeFilters[level];
        // Keep the current selection visible even if it has dropped out of the option list.
        const values =
          value !== ALL && !levelOptions.includes(value) ? [value, ...levelOptions] : levelOptions;

        return (
          <Select key={level} value={value} onValueChange={(next) => onFilterChange(level, next)}>
            <SelectTrigger
              aria-label={`${label} filter`}
              className="h-9 w-full bg-background text-sm"
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
                  {isLoading ? 'Loading…' : 'No options available'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
