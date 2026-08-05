import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRenderGate } from '@/hooks/use-render-gate';
import { useProjectsStore } from '@/stores/projects-store';
import { useUiStore } from '@/stores/ui-store';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    act(() => {
      this.callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    });
  }
}

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const isRendering = useRenderGate(ref);
  return <div ref={ref} data-testid="probe" data-rendering={isRendering} />;
}

const isGated = () => screen.getByTestId('probe').dataset.rendering === 'true';

function setup() {
  render(<Probe />);
  MockIntersectionObserver.instances.at(-1)?.trigger(true);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  MockIntersectionObserver.instances = [];
  useUiStore.setState({ isContactOpen: false, contactSource: null });
  useProjectsStore.setState({ openProjectId: null, activeSlide: 0 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useRenderGate', () => {
  it('is on once the field is on screen and the tab is visible', () => {
    setup();
    expect(isGated()).toBe(true);
  });

  it('is off before the field has reported its first intersection', () => {
    render(<Probe />);
    expect(isGated()).toBe(false);
  });

  it('pauses while the contact modal is open and resumes on close', () => {
    setup();

    act(() => {
      useUiStore.getState().openContact('hero');
    });
    expect(isGated()).toBe(false);

    act(() => {
      useUiStore.getState().closeContact();
    });
    expect(isGated()).toBe(true);
  });

  it('pauses while the project gallery is open and resumes on close', () => {
    setup();

    act(() => {
      useProjectsStore.getState().openProject('dmls-solutions');
    });
    expect(isGated()).toBe(false);

    act(() => {
      useProjectsStore.getState().closeProject();
    });
    expect(isGated()).toBe(true);
  });

  it('stays off when the tab goes hidden', () => {
    setup();
    expect(isGated()).toBe(true);

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(isGated()).toBe(false);

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(isGated()).toBe(true);
  });
});
