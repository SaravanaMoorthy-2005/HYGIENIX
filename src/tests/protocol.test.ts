import { describe, expect, it } from 'vitest';
import {
  accepts,
  begin,
  initialState,
  stepsFor,
  tick,
  MY_HANDS_SPEED_MULTIPLIER,
  type Observation,
  type SimulationState,
} from '../simulation/protocol';

const present = (at: number): Observation => ({
  at,
  technique: -1,
  hands: 2,
  quality: 1,
  score: 0,
  margin: 0,
  moving: false,
  side: null,
});
function advanceTime(
  s: SimulationState,
  seconds: number,
  observation?: (at: number) => Observation | null,
) {
  for (let i = 0; i < seconds * 20; i++) s = tick(s, 0.05, i * 50, observation?.(i * 50) ?? null);
  return s;
}
describe('single kiosk workflow', () => {
  it('walks up, scans RFID, then waits for method selection', () => {
    let s = advanceTime(initialState(), 6);
    expect(s.phase).toBe('rfid');
    s = advanceTime(s, 3);
    expect(s.phase).toBe('welcome');
    expect(advanceTime(s, 30)).toBe(s);
  });
  it.each(['handwash', 'sanitizer'] as const)(
    'finishes %s with demo and verified hands',
    (method) => {
      const sequence = stepsFor(method);
      for (const source of ['demo', 'camera'] as const) {
        let s = begin(initialState(source), method);
        const visited = [sequence[0].id];
        for (let i = 0; i < 1400; i++) {
          const next = tick(s, 0.05, i * 50, source === 'camera' ? present(i * 50) : null);
          if (next.index !== s.index) visited.push(sequence[next.index].id);
          s = next;
        }
        expect(s.phase).toBe('completed');
        expect(visited).toEqual(sequence.map((step) => step.id));
        const expectedSeconds =
          source === 'camera'
            ? (method === 'handwash' ? 53 : 26) / MY_HANDS_SPEED_MULTIPLIER + 0.7
            : method === 'handwash'
              ? 53
              : 26;
        expect(s.elapsed).toBeCloseTo(expectedSeconds, 3);
      }
    },
  );
  it('never introduces water or an air dryer into sanitizer', () => {
    expect(stepsFor('handwash').map((s) => s.id)).toEqual([
      'wet',
      'soap',
      'palms',
      'backs',
      'fingers',
      'knuckles',
      'thumbs',
      'tips',
      'rinse',
      'dryer',
    ]);
    expect(stepsFor('sanitizer').some((s) => s.effect === 'water' || s.effect === 'air')).toBe(
      false,
    );
    expect(stepsFor('sanitizer').at(-1)?.id).toBe('natural');
  });
  it('verifies visible hands rather than claiming a pose or motion match', () => {
    const step = stepsFor('handwash')[2];
    expect(accepts(step, present(1000), 1100)).toBe(true);
    for (const invalid of [
      null,
      { ...present(1000), at: 0 },
      { ...present(1000), at: 1500 },
      { ...present(1000), hands: 1 },
      { ...present(1000), quality: 0.8 },
      { ...present(1000), quality: NaN },
      { ...present(1000), at: NaN },
    ]) {
      expect(accepts(step, invalid, 1100)).toBe(false);
    }
  });
  it('requires stable acquisition once, then keeps it across step boundaries', () => {
    let s = advanceTime(begin(initialState(), 'handwash'), 0.5, present);
    expect(s.progress).toBe(0);
    expect(s.handsVerified).toBe(false);
    s = advanceTime(s, 2.5, present);
    expect(s.index).toBe(1);
    expect(s.handsVerified).toBe(true);
    const next = advanceTime(s, 0.5, present);
    expect(next.progress - s.progress).toBeCloseTo(0.5 * MY_HANDS_SPEED_MULTIPLIER);
  });
  it('brief tracking loss freezes progress without rewinding or restarting acquisition', () => {
    let s = advanceTime(begin(initialState(), 'handwash'), 1, present);
    const progress = s.progress;
    s = advanceTime(s, 0.3);
    expect(s.progress).toBe(progress);
    expect(s.handsVerified).toBe(true);
    s = advanceTime(s, 0.1, present);
    expect(s.progress).toBeCloseTo(progress + 0.1 * MY_HANDS_SPEED_MULTIPLIER);
  });
  it('a sustained loss pauses and requires reacquisition before resuming', () => {
    let s = advanceTime(begin(initialState(), 'handwash'), 2, present);
    const progress = s.progress;
    s = advanceTime(s, 5);
    expect(s.progress).toBe(progress);
    expect(s.handsVerified).toBe(false);
    s = advanceTime(s, 0.5, present);
    expect(s.progress).toBe(progress);
    s = advanceTime(s, 0.5, present);
    expect(s.progress).toBeGreaterThan(progress);
  });
  it('stale evidence cannot finish any step even after successful acquisition', () => {
    for (const method of ['handwash', 'sanitizer'] as const) {
      for (let index = 0; index < stepsFor(method).length; index++) {
        const s = {
          ...begin(initialState(), method),
          index,
          handsVerified: true,
          progress: 0.5,
          sides: [0.5, 0] as [number, number],
        };
        const next = advanceTime(s, 20, () => present(-1000));
        expect(next.index).toBe(index);
        expect(next.progress).toBe(0.5);
        expect(next.phase).toBe('session');
      }
    }
  });
  it('pause and background-sized delays never fast-forward the routine', () => {
    const s = { ...begin(initialState('demo'), 'handwash'), paused: true };
    expect(advanceTime(s, 60)).toBe(s);
    expect(tick({ ...s, paused: false }, 90, 90000, null).progress).toBeLessThanOrEqual(0.1);
  });
  it('restart begins with no camera verification', () => {
    const s = advanceTime(begin(initialState(), 'handwash'), 2, present);
    expect(s.handsVerified).toBe(true);
    expect(begin(s, 'sanitizer').handsVerified).toBe(false);
    expect(initialState().handsVerified).toBe(false);
  });
});
