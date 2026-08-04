import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSwipe } from '@/hooks/use-swipe';

interface Props {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function Stage({ onSwipeLeft, onSwipeRight }: Props) {
  const swipe = useSwipe({ onSwipeLeft, onSwipeRight });
  return <div data-testid="stage" {...swipe} />;
}

function setup() {
  const onSwipeLeft = vi.fn();
  const onSwipeRight = vi.fn();

  render(<Stage onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />);

  return { stage: screen.getByTestId('stage'), onSwipeLeft, onSwipeRight };
}

const touch = (x: number, y: number) => ({ changedTouches: [{ clientX: x, clientY: y }] });
const pointer = (x: number, y: number) => ({ clientX: x, clientY: y, pointerType: 'mouse' });

describe('useSwipe by touch', () => {
  it('steps forward on a leftward drag', () => {
    const { stage, onSwipeLeft, onSwipeRight } = setup();

    fireEvent.touchStart(stage, touch(300, 200));
    fireEvent.touchEnd(stage, touch(200, 205));

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('steps back on a rightward drag', () => {
    const { stage, onSwipeRight } = setup();

    fireEvent.touchStart(stage, touch(100, 200));
    fireEvent.touchEnd(stage, touch(220, 190));

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it('ignores a drag that is mostly vertical', () => {
    const { stage, onSwipeLeft, onSwipeRight } = setup();

    fireEvent.touchStart(stage, touch(300, 100));
    fireEvent.touchEnd(stage, touch(240, 400));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('ignores a tap and any drag under the threshold', () => {
    const { stage, onSwipeLeft, onSwipeRight } = setup();

    fireEvent.touchStart(stage, touch(300, 200));
    fireEvent.touchEnd(stage, touch(300, 200));
    fireEvent.touchStart(stage, touch(300, 200));
    fireEvent.touchEnd(stage, touch(270, 200));

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('drops a gesture the browser takes over', () => {
    const { stage, onSwipeLeft } = setup();

    fireEvent.touchStart(stage, touch(300, 200));
    fireEvent.touchCancel(stage);
    fireEvent.touchEnd(stage, touch(120, 200));

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  /**
   * iOS emits both families for one finger. Acting on each would step two slides per swipe, which
   * is the mirror of the bug that made touch swiping do nothing at all.
   */
  it('counts a finger once when pointer events follow the touch', () => {
    const { stage, onSwipeLeft } = setup();

    fireEvent.touchStart(stage, touch(300, 200));
    fireEvent.touchEnd(stage, touch(180, 200));
    fireEvent.pointerDown(stage, { clientX: 300, clientY: 200, pointerType: 'touch' });
    fireEvent.pointerUp(stage, { clientX: 180, clientY: 200, pointerType: 'touch' });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });
});

describe('useSwipe by mouse', () => {
  it('still steps on a dragged mouse', () => {
    const { stage, onSwipeLeft } = setup();

    fireEvent.pointerDown(stage, pointer(400, 200));
    fireEvent.pointerUp(stage, pointer(300, 210));

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it('drops a cancelled mouse gesture', () => {
    const { stage, onSwipeLeft } = setup();

    fireEvent.pointerDown(stage, pointer(400, 200));
    fireEvent.pointerCancel(stage, pointer(400, 200));
    fireEvent.pointerUp(stage, pointer(300, 200));

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });
});
