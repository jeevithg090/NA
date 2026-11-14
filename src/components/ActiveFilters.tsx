import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ALL,
  FILTER_LABELS,
  FILTER_LEVELS,
  type ActiveFilters as ActiveFiltersState,
  type FilterLevel,
} from '@/lib/papers/filters';

interface ActiveFiltersProps {
  filters: ActiveFiltersState;
  search: string;
  onClearFilter: (level: FilterLevel) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-secondary pl-3 pr-2 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/50 hover:bg-accent"
        aria-label={`Remove ${label}`}
      >
        {label}
        <X className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      </button>
    </li>
  );
}

export function ActiveFilters({
  filters,
  search,
  onClearFilter,
  onClearSearch,
  onClearAll,
}: ActiveFiltersProps) {
  const active = FILTER_LEVELS.filter((level) => filters[level] !== ALL);
  if (active.length === 0 && !search) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Active:</span>
      <ul className="flex flex-wrap gap-2" aria-label="Active filters">
        {search && <Chip label={`Search: “${search}”`} onRemove={onClearSearch} />}
        {active.map((level) => (
          <Chip
            key={level}
            label={`${FILTER_LABELS[level].label}: ${filters[level]}`}
            onRemove={() => onClearFilter(level)}
          />
        ))}
      </ul>
      <Button
        variant="link"
        size="sm"
        onClick={onClearAll}
        className="h-8 px-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
