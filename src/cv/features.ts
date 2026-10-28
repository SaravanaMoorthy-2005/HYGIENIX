import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
export const FRAME_COUNT = 32,
  FEATURE_COUNT = 150;
type P = { x: number; y: number; z: number };
const sub = (a: P, b: P): P => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const len = (a: P) => Math.hypot(a.x, a.y, a.z);
const dot = (a: P, b: P) => a.x * b.x + a.y * b.y + a.z * b.z;
function normal(p: P[]) {
  const a = sub(p[5], p[0]),
    b = sub(p[17], p[0]);
  const n = { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
  const l = len(n) || 1;
  return [n.x / l, n.y / l, n.z / l];
}
export function extractFeatures(result: HandLandmarkerResult, previous?: number[]): number[] {
  const hands: (P[] | undefined)[] = [undefined, undefined];
  result.landmarks.forEach((p, i) => {
    const side = result.handedness[i]?.[0]?.categoryName === 'Left' ? 0 : 1;
    if (!hands[side]) hands[side] = p;
  });
  const scale = Math.max(0.03, ...hands.map((p) => (p ? len(sub(p[9], p[0])) : 0)));
  const row: number[] = [];
  for (const p of hands)
    for (let k = 0; k < 21; k++) {
      const q = p ? sub(p[k], p[0]) : { x: 0, y: 0, z: 0 };
      row.push(q.x / scale, q.y / scale, q.z / scale);
    }
  const relative = hands[0] && hands[1] ? sub(hands[0][0], hands[1][0]) : { x: 0, y: 0, z: 0 };
  row.push(relative.x / scale, relative.y / scale, relative.z / scale);
  hands.forEach((p) => row.push(...(p ? normal(p) : [0, 0, 0])));
  hands.forEach((p) =>
    [1, 5, 9, 13, 17].forEach((k) => {
      if (!p) {
        row.push(0);
        return;
      }
      const a = sub(p[k], p[k + 1]),
        b = sub(p[k + 2], p[k + 1]);
      row.push(Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (len(a) * len(b) || 1)))) / Math.PI);
    }),
  );
  row.push(...hands.map((p) => (p ? 1 : 0)));
  for (let k = 126; k < 129; k++) row.push(previous ? row[k] - previous[k] : 0);
  return row.map((n) => (Number.isFinite(n) ? Math.max(-10, Math.min(10, n)) : 0));
}
export class TemporalBuffer {
  rows: number[][] = [];
  last = 0;
  push(row: number[], now: number) {
    if (now - this.last > 400) this.rows = [];
    this.last = now;
    this.rows.push(row);
    if (this.rows.length > FRAME_COUNT) this.rows.shift();
  }
  clear() {
    this.rows = [];
    this.last = 0;
  }
  get ready() {
    return this.rows.length === FRAME_COUNT;
  }
  get motion() {
    if (this.rows.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < this.rows.length; i++)
      for (let j = 0; j < 129; j++) sum += Math.abs(this.rows[i][j] - this.rows[i - 1][j]);
    return sum / ((this.rows.length - 1) * 129);
  }
  get cycles() {
    let best = 0;
    for (let axis = 0; axis < 3; axis++) {
      let sign = 0,
        turns = 0,
        travel = 0;
      for (const row of this.rows) {
        const d = row[147 + axis];
        travel += Math.abs(d);
        if (Math.abs(d) < 0.025) continue;
        const next = Math.sign(d);
        if (sign && sign !== next && travel > 0.18) {
          turns++;
          travel = 0;
        }
        sign = next;
      }
      best = Math.max(best, Math.floor(turns / 2));
    }
    return best;
  }
}
export function trackingQuality(result: HandLandmarkerResult) {
  if (
    result.landmarks.length !== 2 ||
    result.landmarks.some(
      (hand) => hand.length !== 21 || hand.some((p) => !Number.isFinite(p.x + p.y + p.z)),
    ) ||
    new Set(result.handedness.map((h) => h[0]?.categoryName)).size !== 2
  )
    return 0;
  const visible =
    result.landmarks.flat().filter((p) => p.x > 0.02 && p.x < 0.98 && p.y > 0.02 && p.y < 0.98)
      .length / 42;
  return visible;
}
