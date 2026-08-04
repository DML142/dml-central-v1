import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function IndexLabel({ children, className }: Props) {
  return (
    <span
      className={cn(
        'font-display text-title text-text-faint block leading-none transition-colors duration-(--dur-base)',
        className,
      )}
    >
      {children}
    </span>
  );
}
