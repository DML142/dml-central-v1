import { cva, type VariantProps } from 'class-variance-authority';

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

interface Props extends React.ComponentProps<'button'>, Variants {
  children: React.ReactNode;
}

export function CtaButton({ children, variant, className, type = 'button', ...props }: Props) {
  return (
    <button type={type} className={cn(cta({ variant }), className)} {...props}>
      {children}
      <span aria-hidden="true">→</span>
      <span aria-hidden="true" className="cta-rule" />
    </button>
  );
}
