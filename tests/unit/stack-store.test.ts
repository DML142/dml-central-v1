import { beforeEach, describe, expect, it } from 'vitest';

import { useStackStore } from '@/stores/stack-store';

const state = () => useStackStore.getState();

beforeEach(() => {
  useStackStore.setState({ openPanels: [] });
});

describe('stack store', () => {
  it('starts with every panel closed', () => {
    expect(state().openPanels).toEqual([]);
  });

  it('opens and closes a panel by id', () => {
    state().togglePanel('backend');
    expect(state().openPanels).toEqual(['backend']);

    state().togglePanel('backend');
    expect(state().openPanels).toEqual([]);
  });

  it('keeps several panels open at once', () => {
    state().togglePanel('frontend');
    state().togglePanel('backend');
    state().togglePanel('testing');

    expect(state().openPanels).toEqual(['frontend', 'backend', 'testing']);
  });

  it('closes one panel without touching the others', () => {
    state().setOpenPanels(['frontend', 'backend', 'testing']);
    state().togglePanel('backend');

    expect(state().openPanels).toEqual(['frontend', 'testing']);
  });

  it('replaces the whole set', () => {
    state().setOpenPanels(['frontend']);
    state().setOpenPanels(['devops', 'platforms']);

    expect(state().openPanels).toEqual(['devops', 'platforms']);
  });

  it('never duplicates an id', () => {
    state().setOpenPanels(['frontend']);
    state().togglePanel('frontend');
    state().togglePanel('frontend');

    expect(state().openPanels).toEqual(['frontend']);
  });
});
