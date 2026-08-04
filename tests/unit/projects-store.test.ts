import { beforeEach, describe, expect, it } from 'vitest';

import { useProjectsStore } from '@/stores/projects-store';

const state = () => useProjectsStore.getState();

beforeEach(() => {
  useProjectsStore.setState({ openProjectId: null, activeSlide: 0 });
});

describe('projects store', () => {
  it('opens a project on its first slide', () => {
    state().setSlide(4);
    state().openProject('dmls-solutions');

    expect(state().openProjectId).toBe('dmls-solutions');
    expect(state().activeSlide).toBe(0);
  });

  it('resets the slide on close', () => {
    state().openProject('dmls-solutions');
    state().setSlide(3);
    state().closeProject();

    expect(state().openProjectId).toBeNull();
    expect(state().activeSlide).toBe(0);
  });

  it('steps forward and wraps past the last slide', () => {
    state().setSlide(11);

    state().stepSlide(1, 13);
    expect(state().activeSlide).toBe(12);

    state().stepSlide(1, 13);
    expect(state().activeSlide).toBe(0);
  });

  it('steps backward and wraps past the first slide', () => {
    state().stepSlide(-1, 13);
    expect(state().activeSlide).toBe(12);

    state().stepSlide(-1, 13);
    expect(state().activeSlide).toBe(11);
  });

  it('handles a step larger than the gallery', () => {
    state().stepSlide(20, 13);
    expect(state().activeSlide).toBe(7);

    state().setSlide(0);
    state().stepSlide(-20, 13);
    expect(state().activeSlide).toBe(6);
  });

  it('ignores a step when there is nothing to step through', () => {
    state().stepSlide(1, 0);
    expect(state().activeSlide).toBe(0);

    state().stepSlide(-1, -3);
    expect(state().activeSlide).toBe(0);
  });

  it('stays put on a single-slide gallery', () => {
    state().stepSlide(1, 1);
    expect(state().activeSlide).toBe(0);

    state().stepSlide(-1, 1);
    expect(state().activeSlide).toBe(0);
  });
});
