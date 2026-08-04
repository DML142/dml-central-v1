import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function Chip({ children, className }: Props) {
  return (
    <span
      className={cn(
        'border-line bg-surface-raised text-text-muted text-meta tracking-chip hover:border-line-strong hover:text-text rounded-chip border px-3 py-1 font-mono transition-colors duration-(--dur-fast)',
        className,
      )}
    >
      {children}
    </span>
  );
}
