'use client';

import { cn } from '@/lib/utils';
import type { StackItem } from '@/types/stack';

interface Props {
  item: StackItem;
}

export function StackChip({ item }: Props) {
  return (
    <span
      className={cn(
        'border-line bg-surface-raised text-text-muted text-meta tracking-chip hover:border-line-strong hover:text-text rounded-chip inline-flex items-center gap-2 border px-3 py-1 font-mono transition-colors duration-(--dur-fast)',
      )}
    >
      {item.iconId && (
        // A mask rather than an <img>: the mark stays a silhouette tinted by `currentColor`
        // (tech.md 10) and the file never enters the JavaScript bundle. The URL is per-item data,
        // which is the one case §6.4 allows an inline style for.
        <span
          aria-hidden="true"
          className="stack-icon"
          style={
            { '--stack-icon': `url('/icons/stack/${item.iconId}.svg')` } as React.CSSProperties
          }
        />
      )}
      {item.label}
      {item.version && <span className="text-text-faint">{item.version}</span>}
    </span>
  );
}
