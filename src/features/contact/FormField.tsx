'use client';

import { cn } from '@/lib/utils';

interface Props {
  name: string;
  label: React.ReactNode;
  /** Rendered on the right of the label row: the optional marker or the character counter. */
  aside?: React.ReactNode;
  error?: string | undefined;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string;
    className: string;
  }) => React.ReactNode;
}

export function FormField({ name, label, aside, error, children }: Props) {
  const id = `field-${name}`;
  const errorId = `error-${name}`;

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      <label
        htmlFor={id}
        className="micro text-text-muted flex items-baseline justify-between gap-3"
      >
        {label}
        {aside}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': errorId,
        className: cn(
          'border-line bg-void text-text placeholder:text-text-faint hover:border-line-strong duration-(--dur-fast) min-h-11 w-full border p-3 transition-colors',
          error && 'border-danger',
        ),
      })}

      <p id={errorId} className="text-danger text-meta font-mono md:min-h-6">
        {error}
      </p>
    </div>
  );
}
