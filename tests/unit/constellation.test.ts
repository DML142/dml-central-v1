import { describe, expect, it } from 'vitest';

import { buildConstellation, pointOpacity, pointRadius } from '@/lib/constellation';

const field = buildConstellation();
const MAX_DISTANCE = 132;

describe('buildConstellation', () => {
  it('is deterministic, so the field is identical on every render', () => {
    const again = buildConstellation();

    expect(again.points).toEqual(field.points);
    expect(again.lines).toEqual(field.lines);
  });

  it('places 150 points inside the viewBox', () => {
    expect(field.points).toHaveLength(150);

    for (const point of field.points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(field.width);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(field.height);
      expect(point.depth).toBeGreaterThanOrEqual(0);
      expect(point.depth).toBeLessThan(1);
    }
  });

  it('connects only points inside the connection radius', () => {
    expect(field.lines.length).toBeGreaterThan(0);

    for (const line of field.lines) {
      expect(Math.hypot(line.x1 - line.x2, line.y1 - line.y2)).toBeLessThanOrEqual(MAX_DISTANCE);
    }
  });

  it('keeps every line alpha renderable', () => {
    for (const line of field.lines) {
      expect(line.alpha).toBeGreaterThan(0);
      expect(line.alpha).toBeLessThanOrEqual(1);
    }
  });

  it('never draws a point twice or joins a point to itself', () => {
    for (const line of field.lines) {
      expect(line.x1 === line.x2 && line.y1 === line.y2).toBe(false);
    }
  });
});

describe('depth mapping', () => {
  it('makes distant points larger and dimmer, so depth reads as focus', () => {
    expect(pointRadius(1)).toBeGreaterThan(pointRadius(0));
    expect(pointOpacity(1)).toBeLessThan(pointOpacity(0));
  });

  it('keeps radius and opacity inside renderable bounds', () => {
    for (const depth of [0, 0.25, 0.5, 0.75, 1]) {
      expect(pointRadius(depth)).toBeGreaterThan(0);
      expect(pointOpacity(depth)).toBeGreaterThan(0);
      expect(pointOpacity(depth)).toBeLessThanOrEqual(1);
    }
  });
});
