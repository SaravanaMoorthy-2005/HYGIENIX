import { describe, expect, it } from 'vitest';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { LandmarkSmoother, observePresence } from '../cv/handPresence';
function fixture(): HandLandmarkerResult {
  return {
    landmarks: [0, 1].map((h) =>
      Array.from({ length: 21 }, (_, i) => ({
        x: 0.2 + h * 0.4 + (i % 4) * 0.025,
        y: 0.3 + Math.floor(i / 4) * 0.025,
        z: 0,
        visibility: 1,
      })),
    ),
    handedness: ['Left', 'Right'].map((categoryName) => [
      { categoryName, displayName: categoryName, score: 0.99, index: 0 },
    ]),
    worldLandmarks: [],
    handednesses: [],
  };
}
describe('camera hand presence', () => {
  it('accepts two well-framed hands even if handedness is ambiguous during overlap', () => {
    const f = fixture();
    f.handedness[1] = f.handedness[0];
    expect(observePresence(f, 100).quality).toBe(1);
    expect(observePresence(f, 100).technique).toBe(-1);
  });
  it('rejects missing, malformed, very small, and non-finite hand evidence', () => {
    const f = fixture();
    f.landmarks.pop();
    expect(observePresence(f, 0).quality).toBe(0);
    const malformed = fixture();
    malformed.landmarks[1].pop();
    expect(observePresence(malformed, 0).quality).toBe(0);
    const tiny = fixture();
    tiny.landmarks[1].forEach((p) => {
      p.x = 0.5;
      p.y = 0.5;
    });
    expect(observePresence(tiny, 0).quality).toBe(0);
    const invalid = fixture();
    invalid.landmarks[0][5].x = NaN;
    expect(observePresence(invalid, 0).quality).toBe(0);
  });
  it('checks each hand separately so a fully visible hand cannot hide a cropped one', () => {
    const f = fixture();
    f.landmarks[1].slice(0, 6).forEach((p) => {
      p.x = -0.1;
    });
    expect(observePresence(f, 0).quality).toBeLessThan(0.85);
  });
});
describe('landmark drawing continuity', () => {
  it('smooths small jitter without changing raw camera evidence', () => {
    const smoother = new LandmarkSmoother(),
      f = fixture();
    smoother.update(f.landmarks, 1000);
    f.landmarks[0][0].x += 0.02;
    const drawn = smoother.update(f.landmarks, 1030);
    expect(drawn[0][0].x).toBeGreaterThan(0.2);
    expect(drawn[0][0].x).toBeLessThan(0.22);
    expect(f.landmarks[0][0].x).toBeCloseTo(0.22);
  });
  it('keeps identities when the detector changes output order', () => {
    const smoother = new LandmarkSmoother(),
      f = fixture();
    const first = smoother.update(f.landmarks, 1000);
    const next = smoother.update([...f.landmarks].reverse(), 1050);
    expect(next).toEqual(first);
  });
  it('never draws a missing hand or carries a stale trace across reacquisition', () => {
    const smoother = new LandmarkSmoother(),
      f = fixture();
    smoother.update(f.landmarks, 1000);
    expect(smoother.update([], 1050)).toEqual([]);
    f.landmarks[0][0].x += 0.02;
    expect(smoother.update(f.landmarks, 1100)).toEqual(f.landmarks);
    f.landmarks[0][0].x += 0.01;
    expect(smoother.update(f.landmarks, 2000)).toEqual(f.landmarks);
  });
});
