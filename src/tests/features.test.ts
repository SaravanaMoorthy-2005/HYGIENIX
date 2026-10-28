import { describe, it, expect } from 'vitest';
import { extractFeatures, TemporalBuffer, FEATURE_COUNT, trackingQuality } from '../cv/features';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
function fixture(reverse = false): HandLandmarkerResult {
  const hands = [0, 1].map((h) =>
    Array.from({ length: 21 }, (_, i) => ({
      x: 0.3 + h * 0.3 + (i % 4) * 0.01,
      y: 0.4 + Math.floor(i / 4) * 0.02,
      z: i * 0.001,
      visibility: 1,
    })),
  );
  const handedness = ['Left', 'Right'].map((categoryName) => [
    { categoryName, displayName: categoryName, score: 0.99, index: 0 },
  ]);
  return {
    landmarks: reverse ? hands.reverse() : hands,
    worldLandmarks: [],
    handedness: reverse ? handedness.reverse() : handedness,
    handednesses: [],
  };
}
describe('temporal landmark features (synthetic logic fixtures)', () => {
  it('has the documented finite shape', () => {
    const features = extractFeatures(fixture());
    expect(features).toHaveLength(FEATURE_COUNT);
    expect(features.every(Number.isFinite)).toBe(true);
  });
  it('maps handedness instead of detection array ordering', () =>
    expect(extractFeatures(fixture(true))).toEqual(extractFeatures(fixture())));
  it('normalizes translation and preserves inter-hand relations', () => {
    const f = fixture(),
      a = extractFeatures(f);
    f.landmarks.forEach((hand) =>
      hand.forEach((p) => {
        p.x += 0.1;
        p.y += 0.1;
      }),
    );
    const b = extractFeatures(f);
    a.forEach((n, i) => expect(b[i]).toBeCloseTo(n, 6));
  });
  it('treats missing hands as insufficient tracking', () => {
    const f = fixture();
    f.landmarks.pop();
    expect(trackingQuality(f)).toBe(0);
    expect(extractFeatures(f).length).toBe(FEATURE_COUNT);
  });
  it('bounds the window and clears it after a time gap', () => {
    const b = new TemporalBuffer();
    for (let i = 0; i < 50; i++) b.push(Array(FEATURE_COUNT).fill(0), i * 70);
    expect(b.rows.length).toBe(32);
    expect(b.motion).toBe(0);
    expect(b.cycles).toBe(0);
    b.push(Array(FEATURE_COUNT).fill(0), 5000);
    expect(b.ready).toBe(false);
    expect(b.rows.length).toBe(1);
  });
});
