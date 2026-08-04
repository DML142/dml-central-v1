import { cn } from '@/lib/utils';

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function InlineLink({ href, children, className }: Props) {
  return (
    <a
      href={href}
      rel="noreferrer noopener"
      className={cn(
        'micro text-text-muted hover:text-violet-bright hover:border-b-violet-bright inline-flex min-h-11 items-center gap-2 border-b border-b-transparent no-underline transition-colors duration-(--dur-fast)',
        className,
      )}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
