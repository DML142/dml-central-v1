import type { RevealVariant } from '@/lib/motion/reveal-plan';

interface Props {
  children: React.ReactNode;
  /**
   * `fade` lifts and fades in. `wipe` uncovers the block left to right and never touches opacity.
   * `lines` sends each line of text up from behind its own edge. `type` sets the text a character
   * at a time. The last two rewrite the text into pieces and put it back when they finish.
   */
  variant?: RevealVariant;
  /** Move the direct children in sequence instead of the wrapper as one block. */
  stagger?: boolean;
  /** Play on load instead of waiting to be scrolled to. The hero runs on no trigger at all. */
  immediate?: boolean;
  className?: string;
}

/**
 * Marks a block for the reveal runtime. It carries no JavaScript of its own: the attributes are the
 * whole contract, and the runtime that reads them only ever loads when motion is allowed. If it
 * never loads, the content is simply on screen — nothing here is revealed by animation alone
 * (tech.md 11).
 */
export function Reveal({
  children,
  variant = 'fade',
  stagger = false,
  immediate = false,
  className,
}: Props) {
  return (
    <div
      className={className}
      data-reveal={variant}
      {...(stagger ? { 'data-reveal-stagger': '' } : {})}
      {...(immediate ? { 'data-reveal-immediate': '' } : {})}
    >
      {children}
    </div>
  );
}
