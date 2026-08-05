import type { RevealVariant } from '@/lib/motion/reveal-plan';

interface Props {
  children: React.ReactNode;
  /** `fade` lifts and fades in; `wipe` uncovers left to right and never touches opacity. */
  variant?: RevealVariant;
  /** Move the direct children in sequence instead of the wrapper as one block. */
  stagger?: boolean;
  className?: string;
}

/**
 * Marks a block for the reveal runtime. It carries no JavaScript of its own: the attributes are the
 * whole contract, and the runtime that reads them only ever loads when motion is allowed. If it
 * never loads, the content is simply on screen — nothing here is revealed by animation alone
 * (tech.md 11).
 */
export function Reveal({ children, variant = 'fade', stagger = false, className }: Props) {
  return (
    <div
      className={className}
      data-reveal={variant}
      {...(stagger ? { 'data-reveal-stagger': '' } : {})}
    >
      {children}
    </div>
  );
}
