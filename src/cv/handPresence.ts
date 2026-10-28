import type { HandLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Observation } from '../simulation/protocol';

// Handedness labels can flip or duplicate during overlapping hands. Presence
// uses the two detected landmark sets, not left/right classification confidence.
export function observePresence(result: HandLandmarkerResult, at: number): Observation {
  const hands = result.landmarks;
  const valid =
    hands.length === 2 &&
    hands.every((hand) => {
      if (hand.length !== 21 || hand.some((p) => !Number.isFinite(p.x + p.y + p.z))) return false;
      const width = Math.max(...hand.map((p) => p.x)) - Math.min(...hand.map((p) => p.x));
      const height = Math.max(...hand.map((p) => p.y)) - Math.min(...hand.map((p) => p.y));
      return Math.max(width, height) >= 0.06 && Math.min(width, height) >= 0.015;
    });
  const quality = valid
    ? Math.min(
        ...hands.map(
          (hand) =>
            hand.filter((p) => p.x >= 0.01 && p.x <= 0.99 && p.y >= 0.01 && p.y <= 0.99).length /
            21,
        ),
      )
    : 0;
  return {
    at,
    hands: hands.length,
    quality,
    technique: -1,
    score: 0,
    margin: 0,
    moving: false,
    side: null,
  };
}

// Only the drawing is smoothed. Raw current-frame evidence drives presence,
// so missing or out-of-frame hands are never invented by this filter.
export class LandmarkSmoother {
  private previous: NormalizedLandmark[][] = [];
  private last = 0;
  reset() {
    this.previous = [];
    this.last = 0;
  }
  update(hands: NormalizedLandmark[][], at: number): NormalizedLandmark[][] {
    if (hands.length !== this.previous.length || at - this.last > 350 || at <= this.last)
      this.previous = [];
    let ordered = hands;
    if (hands.length === 2 && this.previous.length === 2) {
      const distance = (a: NormalizedLandmark, b: NormalizedLandmark) =>
        Math.hypot(a.x - b.x, a.y - b.y);
      const direct =
        distance(hands[0][0], this.previous[0][0]) + distance(hands[1][0], this.previous[1][0]);
      const crossed =
        distance(hands[0][0], this.previous[1][0]) + distance(hands[1][0], this.previous[0][0]);
      if (crossed < direct) ordered = [hands[1], hands[0]];
    }
    const alpha = Math.max(0.35, 1 - Math.exp(-(at - this.last) / 55));
    const result = ordered.map((hand, i) =>
      hand.map((p, j) => {
        const previous = this.previous[i]?.[j];
        if (!previous || Math.hypot(p.x - previous.x, p.y - previous.y) > 0.12) return { ...p };
        return {
          ...p,
          x: previous.x + (p.x - previous.x) * alpha,
          y: previous.y + (p.y - previous.y) * alpha,
          z: previous.z + (p.z - previous.z) * alpha,
        };
      }),
    );
    this.previous = result;
    this.last = at;
    return result;
  }
}
