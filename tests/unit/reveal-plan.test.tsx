import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Reveal } from '@/components/common/Reveal';
import { planReveal, planReveals } from '@/lib/motion/reveal-plan';

const mount = (markup: string): HTMLElement => {
  const host = document.createElement('div');
  host.innerHTML = markup;
  return host;
};

const only = (host: ParentNode): HTMLElement => {
  const element = host.querySelector<HTMLElement>('[data-reveal]');
  if (!element) throw new Error('no reveal in the fixture');
  return element;
};

describe('planReveal', () => {
  it('moves the container itself when nothing is staggered', () => {
    const host = mount('<div data-reveal="fade"><p>one</p><p>two</p></div>');
    const element = only(host);

    expect(planReveal(element)).toEqual({
      trigger: element,
      variant: 'fade',
      targets: [element],
    });
  });

  it('hands the motion to the direct children when staggered', () => {
    const host = mount('<div data-reveal="wipe" data-reveal-stagger><p>a</p><p>b</p></div>');
    const element = only(host);
    const plan = planReveal(element);

    expect(plan.variant).toBe('wipe');
    expect(plan.trigger).toBe(element);
    expect(plan.targets).toEqual([...element.children]);
  });

  it('staggers only the direct children, never the whole subtree', () => {
    const host = mount(
      '<div data-reveal="fade" data-reveal-stagger><div><span>deep</span></div></div>',
    );
    const plan = planReveal(only(host));

    expect(plan.targets).toHaveLength(1);
    expect(plan.targets[0]?.tagName).toBe('DIV');
  });

  it('falls back to fade for a variant it does not know', () => {
    const host = mount('<div data-reveal="slide-in-from-space">x</div>');

    expect(planReveal(only(host)).variant).toBe('fade');
  });

  it('falls back to fade for a bare attribute', () => {
    const host = mount('<div data-reveal>x</div>');

    expect(planReveal(only(host)).variant).toBe('fade');
  });
});

describe('planReveals', () => {
  it('returns every container in document order', () => {
    const host = mount(
      '<div data-reveal="fade" id="first">a</div><div data-reveal="wipe" id="second">b</div>',
    );

    expect(planReveals(host).map((plan) => plan.trigger.id)).toEqual(['first', 'second']);
  });

  it('drops a staggered container with nothing inside it', () => {
    const host = mount('<div data-reveal="fade" data-reveal-stagger></div>');

    expect(planReveals(host)).toEqual([]);
  });

  it('finds nothing on a page that marks nothing', () => {
    const host = mount('<div><p>plain</p></div>');

    expect(planReveals(host)).toEqual([]);
  });
});

describe('Reveal', () => {
  it('emits the attributes the planner reads', () => {
    const { container } = render(
      <Reveal variant="wipe" stagger className="grid">
        <p>a</p>
        <p>b</p>
      </Reveal>,
    );
    const plan = planReveal(only(container));

    expect(plan.variant).toBe('wipe');
    expect(plan.targets).toHaveLength(2);
    expect(only(container).className).toBe('grid');
  });

  it('defaults to a fade that moves as one block', () => {
    const { container } = render(
      <Reveal>
        <p>a</p>
      </Reveal>,
    );
    const plan = planReveal(only(container));

    expect(plan.variant).toBe('fade');
    expect(plan.targets).toEqual([only(container)]);
  });
});
