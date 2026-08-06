import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const cta = cva(
  'micro relative inline-flex min-h-11 cursor-pointer items-center justify-between gap-6 border px-(--cta-pad-x) py-3 font-medium no-underline transition-colors duration-(--dur-fast) ease-out disabled:cursor-not-allowed disabled:opacity-45',
  {
    variants: {
      variant: {
        solid:
          'border-violet bg-violet text-void hover:border-violet-bright hover:bg-violet-bright disabled:hover:border-violet disabled:hover:bg-violet',
        ghost:
          'border-line-strong text-text bg-transparent hover:border-violet-bright hover:bg-surface-raised disabled:hover:border-line-strong disabled:hover:bg-transparent',
        inverted: 'border-void bg-void text-text hover:border-surface hover:bg-surface',
      },
    },
    defaultVariants: { variant: 'solid' },
  },
);

type Variants = VariantProps<typeof cta>;

interface ButtonProps extends React.ComponentProps<'button'>, Variants {
  children: React.ReactNode;
  href?: undefined;
}

interface LinkProps extends React.ComponentProps<typeof Link>, Variants {
  children: React.ReactNode;
}

type Props = ButtonProps | LinkProps;

// A real `<a>`/`Link` when navigating, a `<button>` otherwise — one visual pattern, one component
// (tech.md 6.3), rather than hand-copying the classes at each call site that needs to navigate.
export function CtaButton({ children, variant, className, ...props }: Props) {
  const classes = cn(cta({ variant }), className);

  if ('href' in props && props.href !== undefined) {
    return (
      <Link className={classes} {...props}>
        {children}
        <span aria-hidden="true">→</span>
        <span aria-hidden="true" className="cta-rule" />
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = props as ButtonProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
      <span aria-hidden="true">→</span>
      <span aria-hidden="true" className="cta-rule" />
    </button>
  );
}
