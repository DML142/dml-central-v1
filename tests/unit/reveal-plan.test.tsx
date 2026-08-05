import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Reveal } from '@/components/common/Reveal';
import { collectTextBlocks, planReveal, planReveals } from '@/lib/motion/reveal-plan';

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
      immediate: false,
    });
  });

  it.each(['fade', 'wipe', 'lines', 'type'])('keeps the %s variant it is given', (variant) => {
    const host = mount(`<div data-reveal="${variant}">x</div>`);

    expect(planReveal(only(host)).variant).toBe(variant);
  });

  it('marks a block that plays on load rather than on a trigger', () => {
    const host = mount('<div data-reveal="lines" data-reveal-immediate>x</div>');

    expect(planReveal(only(host)).immediate).toBe(true);
  });

  it.each(['lines', 'type'])('points a %s reveal at the text, not at the wrapper', (variant) => {
    const host = mount(
      `<div data-reveal="${variant}"><div><h2>Build</h2><p>Typed end to end.</p></div></div>`,
    );
    const plan = planReveal(only(host));

    expect(plan.targets.map((target) => target.tagName)).toEqual(['H2', 'P']);
    expect(plan.trigger).toBe(only(host));
  });

  it('ignores the stagger flag on a text reveal, which cuts by element anyway', () => {
    const host = mount('<div data-reveal="lines" data-reveal-stagger><h2>One</h2></div>');

    expect(planReveal(only(host)).targets.map((target) => target.tagName)).toEqual(['H2']);
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

describe('collectTextBlocks', () => {
  it('reaches the text inside a layout container instead of the container', () => {
    // The step row: a grid of cards, each holding a label, a title and a paragraph. Handing the
    // grid itself to a splitter collapses its columns.
    const host = mount(`
      <div class="grid">
        <div class="card"><span>01</span><h2>Build</h2><p>Typed end to end.</p></div>
        <div class="card"><span>02</span><h2>Ship</h2><p>Docker locally.</p></div>
      </div>
    `);
    const blocks = collectTextBlocks(host.firstElementChild as HTMLElement);

    expect(blocks.map((block) => block.tagName)).toEqual(['SPAN', 'H2', 'P', 'SPAN', 'H2', 'P']);
  });

  it('keeps an element that mixes its own text with children whole', () => {
    // Descending here would leave "Read " and " of it" behind.
    const host = mount('<p>Read <strong>every word</strong> of it</p>');
    const blocks = collectTextBlocks(host.firstElementChild as HTMLElement);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.tagName).toBe('P');
  });

  it('takes a leaf that is only text', () => {
    const host = mount('<h1>Full-stack systems that stay up.</h1>');

    expect(collectTextBlocks(host.firstElementChild as HTMLElement)).toHaveLength(1);
  });

  it('ignores a branch that carries no text at all', () => {
    const host = mount('<div><div><span>  </span></div></div>');

    expect(collectTextBlocks(host.firstElementChild as HTMLElement)).toEqual([]);
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
      <Reveal variant="wipe" stagger immediate className="grid">
        <p>a</p>
        <p>b</p>
      </Reveal>,
    );
    const plan = planReveal(only(container));

    expect(plan.variant).toBe('wipe');
    expect(plan.targets).toHaveLength(2);
    expect(plan.immediate).toBe(true);
    expect(only(container).className).toBe('grid');
  });

  it('defaults to a fade that moves as one block on a trigger', () => {
    const { container } = render(
      <Reveal>
        <p>a</p>
      </Reveal>,
    );
    const plan = planReveal(only(container));

    expect(plan.variant).toBe('fade');
    expect(plan.targets).toEqual([only(container)]);
    expect(plan.immediate).toBe(false);
  });
});
