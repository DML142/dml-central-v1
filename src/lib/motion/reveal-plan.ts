export type RevealVariant = 'fade' | 'wipe';

export interface RevealPlan {
  /** The container whose position decides when the reveal starts. */
  trigger: HTMLElement;
  variant: RevealVariant;
  /** What actually moves: the container itself, or its direct children when staggering. */
  targets: HTMLElement[];
}

const isVariant = (value: string | undefined): value is RevealVariant =>
  value === 'fade' || value === 'wipe';

const isElement = (node: Element): node is HTMLElement => node instanceof HTMLElement;

/**
 * Reads one `[data-reveal]` container. The container decides whether it moves as a block or hands
 * the motion to its children (tech.md 9.2), so a child never has to know it is being revealed.
 */
export function planReveal(element: HTMLElement): RevealPlan {
  const declared = element.dataset.reveal;

  return {
    trigger: element,
    variant: isVariant(declared) ? declared : 'fade',
    targets: element.hasAttribute('data-reveal-stagger')
      ? Array.from(element.children).filter(isElement)
      : [element],
  };
}

/** Every reveal on the page, in document order. Containers with nothing to move are dropped. */
export function planReveals(root: ParentNode): RevealPlan[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    .map(planReveal)
    .filter((plan) => plan.targets.length > 0);
}
