export type RevealVariant = 'fade' | 'wipe' | 'lines' | 'type';

/** The two that rewrite the text into pieces, and so need the DOM back when they are done. */
export const SPLIT_VARIANTS: readonly RevealVariant[] = ['lines', 'type'];

export interface RevealPlan {
  /** The container whose position decides when the reveal starts. */
  trigger: HTMLElement;
  variant: RevealVariant;
  /** What actually moves: the container itself, or its direct children when staggering. */
  targets: HTMLElement[];
  /** Plays as part of the load sequence rather than waiting to be scrolled to. */
  immediate: boolean;
}

const isVariant = (value: string | undefined): value is RevealVariant =>
  value === 'fade' || value === 'wipe' || value === 'lines' || value === 'type';

const isElement = (node: Element): node is HTMLElement => node instanceof HTMLElement;

const hasOwnText = (element: Element): boolean =>
  Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && (node.textContent?.trim().length ?? 0) > 0,
  );

/**
 * The elements a text reveal may cut, which are the ones that hold text and nothing else.
 *
 * A split has to be pointed at text, never at a layout container: given a grid, SplitText gathers
 * the lines of the whole subtree and lifts their wrappers out of the cells they belonged to, which
 * collapses the columns. Measured on the step row — splitting the grid took it from 174px to 512px
 * and shoved every section below the hero down the page while the hero was still animating.
 */
export function collectTextBlocks(root: HTMLElement): HTMLElement[] {
  const children = Array.from(root.children).filter(isElement);

  // An element mixing its own text with child elements is a text block itself — descending would
  // drop the loose text on the floor.
  if (children.length === 0 || hasOwnText(root)) {
    return root.textContent?.trim() ? [root] : [];
  }

  return children.flatMap(collectTextBlocks);
}

/**
 * Reads one `[data-reveal]` container. The container decides whether it moves as a block or hands
 * the motion to its children (tech.md 9.2), so a child never has to know it is being revealed.
 */
export function planReveal(element: HTMLElement): RevealPlan {
  const declared = element.dataset.reveal;
  const variant = isVariant(declared) ? declared : 'fade';

  const targets = SPLIT_VARIANTS.includes(variant)
    ? collectTextBlocks(element)
    : element.hasAttribute('data-reveal-stagger')
      ? Array.from(element.children).filter(isElement)
      : [element];

  return {
    trigger: element,
    variant,
    immediate: element.hasAttribute('data-reveal-immediate'),
    targets,
  };
}

/** Every reveal on the page, in document order. Containers with nothing to move are dropped. */
export function planReveals(root: ParentNode): RevealPlan[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    .map(planReveal)
    .filter((plan) => plan.targets.length > 0);
}
