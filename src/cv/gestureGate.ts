import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import type { Observation } from '../simulation/protocol';
import { trackingQuality } from './features';
type Point = { x: number; y: number; z: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const average = (p: Point[]) => ({
  x: p.reduce((v, x) => v + x.x, 0) / p.length,
  y: p.reduce((v, x) => v + x.y, 0) / p.length,
  z: p.reduce((v, x) => v + x.z, 0) / p.length,
});
function normal(p: Point[], side: number) {
  const a = { x: p[5].x - p[0].x, y: p[5].y - p[0].y, z: p[5].z - p[0].z };
  const b = { x: p[17].x - p[0].x, y: p[17].y - p[0].y, z: p[17].z - p[0].z };
  const n = { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
  const scale = Math.hypot(n.x, n.y, n.z) || 1;
  return { x: (n.x / scale) * side, y: (n.y / scale) * side, z: (n.z / scale) * side };
}
// Experimental geometric matching; scores are not calibrated probabilities.
// All six poses are scored independently of the expected step.
export class GestureGate {
  private history: { at: number; point: Point }[] = [];
  reset() {
    this.history = [];
  }
  observe(result: HandLandmarkerResult, at: number): Observation {
    const quality = trackingQuality(result);
    const empty: Observation = {
      at,
      hands: result.landmarks.length,
      quality,
      technique: -1,
      score: 0,
      margin: 0,
      moving: false,
      side: null,
    };
    if (quality < 0.85) {
      this.reset();
      return empty;
    }
    const order = result.handedness[0]?.[0]?.categoryName === 'Left' ? [0, 1] : [1, 0];
    const p = order.map((i) => result.landmarks[i]);
    if (p.some((h) => h.length !== 21 || h.some((v) => !Number.isFinite(v.x + v.y + v.z))))
      return empty;
    const scale = Math.max(0.03, (distance(p[0][0], p[0][9]) + distance(p[1][0], p[1][9])) / 2);
    const center = p.map((h) => average([h[0], h[5], h[9], h[13], h[17]]));
    const gap = distance(center[0], center[1]) / scale;
    if (gap > 2.5) {
      this.reset();
      return empty;
    }
    const relative = {
      x: (center[0].x - center[1].x) / scale,
      y: (center[0].y - center[1].y) / scale,
      z: (center[0].z - center[1].z) / scale,
    };
    if (this.history.length && at - this.history[this.history.length - 1].at > 350) this.reset();
    this.history.push({ at, point: relative });
    this.history = this.history.filter((x) => at - x.at <= 1100);
    let travel = 0,
      turns = 0;
    const lastSign = [0, 0, 0];
    for (let i = 1; i < this.history.length; i++) {
      const before = this.history[i - 1].point,
        current = this.history[i].point;
      travel += distance(before, current);
      (['x', 'y', 'z'] as const).forEach((axis, k) => {
        const delta = current[axis] - before[axis];
        if (Math.abs(delta) < 0.018) return;
        const sign = Math.sign(delta);
        if (lastSign[k] && lastSign[k] !== sign) turns++;
        lastSign[k] = sign;
      });
    }
    const moving =
      this.history.length >= 6 &&
      at - this.history[0].at >= 350 &&
      travel > 0.24 &&
      travel < 7 &&
      turns >= 1;
    const curls = p.map(
      (h) =>
        [8, 12, 16, 20].reduce(
          (sum, tip) =>
            sum + clamp(((distance(h[tip - 2], h[0]) - distance(h[tip], h[0])) / scale) * 2 + 0.35),
          0,
        ) / 4,
    );
    const spread = p.map((h) => clamp((distance(h[8], h[20]) / scale - 0.45) / 0.85));
    const n = p.map((h, i) => normal(h, i === 0 ? 1 : -1));
    const alignment = n[0].x * n[1].x + n[0].y * n[1].y + n[0].z * n[1].z;
    const opposed = clamp((1 - alignment) / 2),
      parallel = 1 - opposed;
    const open = 1 - Math.max(...curls),
      curled = Math.min(...curls);
    const together = clamp(1 - Math.max(0, gap - 0.8) / 1.5);
    const tipContact = p.map((h, i) =>
      clamp(1 - distance(average([h[8], h[12], h[16], h[20]]), center[1 - i]) / scale),
    );
    const thumbContact = p.map((h, i) => clamp(1 - distance(h[4], center[1 - i]) / scale));
    const asymmetry = Math.abs(curls[0] - curls[1]);
    const scores = [
      together * (0.45 * opposed + 0.4 * open + 0.15 * (1 - Math.max(...spread))),
      together * (0.6 * parallel + 0.4 * open),
      together *
        (0.4 * opposed + 0.3 * Math.min(...spread) + 0.3 * (1 - Math.abs(curls[0] - 0.35))),
      together * (0.5 * curled + 0.3 * opposed + 0.2 * (1 - asymmetry)),
      together * (0.45 * Math.max(...thumbContact) + 0.35 * Math.max(...curls) + 0.2 * asymmetry),
      together * (0.5 * Math.max(...tipContact) + 0.3 * asymmetry + 0.2 * Math.max(...curls)),
    ];
    const ranked = scores
      .map((score, technique) => ({ score, technique }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    let side: Observation['side'] = null;
    if (best.technique === 1 && Math.abs(n[0].z - n[1].z) > 0.12)
      side = n[0].z > n[1].z ? 'left' : 'right';
    if (best.technique === 4 && asymmetry > 0.18) side = curls[0] < curls[1] ? 'left' : 'right';
    if (best.technique === 5 && Math.abs(tipContact[0] - tipContact[1]) > 0.15)
      side = tipContact[0] > tipContact[1] ? 'left' : 'right';
    return { ...empty, ...best, margin: best.score - ranked[1].score, moving, side };
  }
}
