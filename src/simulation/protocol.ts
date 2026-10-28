export type Method = 'handwash' | 'sanitizer';
export type InputSource = 'camera' | 'demo';
export type Phase = 'approach' | 'rfid' | 'welcome' | 'session' | 'completed';
export type Effect = 'water' | 'soap' | 'sanitizer' | 'air' | 'none';
export interface Step {
  id: string;
  title: string;
  instruction: string;
  technique: number;
  seconds: number;
  effect: Effect;
  bilateral?: boolean;
}
const movements: Omit<Step, 'seconds' | 'effect'>[] = [
  {
    id: 'palms',
    title: 'Palm to palm',
    instruction: 'Bring your palms together. Rub back and forth across both surfaces.',
    technique: 0,
  },
  {
    id: 'backs',
    title: 'Back of hands',
    instruction: 'Rub your palm over the back of the other hand. Switch hands and repeat.',
    technique: 1,
    bilateral: true,
  },
  {
    id: 'fingers',
    title: 'Between fingers',
    instruction: 'Interlace your fingers, palms together. Rub along the spaces between them.',
    technique: 2,
  },
  {
    id: 'knuckles',
    title: 'Backs of fingers',
    instruction: 'Hook your bent fingers together. Rub their backs against the opposite palm.',
    technique: 3,
  },
  {
    id: 'thumbs',
    title: 'Rotate around each thumb',
    instruction: 'Wrap one hand around the opposite thumb and rotate. Then switch thumbs.',
    technique: 4,
    bilateral: true,
  },
  {
    id: 'tips',
    title: 'Fingertips & nails',
    instruction: 'Circle your fingertips in the opposite palm. Switch hands and repeat.',
    technique: 5,
    bilateral: true,
  },
];
export function stepsFor(method: Method): Step[] {
  const rubbing = movements.map((s) => ({
    ...s,
    seconds: method === 'handwash' ? 6 : 3,
    effect: 'none' as const,
  }));
  return method === 'handwash'
    ? [
        {
          id: 'wet',
          title: 'Wet your hands',
          instruction: 'Place both hands beneath the water outlet. Let the water cover both hands.',
          technique: -1,
          seconds: 4,
          effect: 'water',
        },
        {
          id: 'soap',
          title: 'Apply soap',
          instruction:
            'Hold your palms under the soap dispenser. Spread the soap across your hands.',
          technique: -1,
          seconds: 3,
          effect: 'soap',
        },
        ...rubbing,
        {
          id: 'rinse',
          title: 'Rinse your hands',
          instruction: 'Turn both hands under the running water to rinse away the soap.',
          technique: -1,
          seconds: 5,
          effect: 'water',
        },
        {
          id: 'dryer',
          title: 'Dry with warm air',
          instruction: 'Hold both hands beneath the air outlet while the drying cycle finishes.',
          technique: -1,
          seconds: 5,
          effect: 'air',
        },
      ]
    : [
        {
          id: 'sanitizer',
          title: 'Apply sanitizer',
          instruction:
            'Start with dry hands. Hold your palm under the dispenser to receive sanitizer.',
          technique: -1,
          seconds: 2,
          effect: 'sanitizer',
        },
        ...rubbing,
        {
          id: 'natural',
          title: 'Rub until naturally dry',
          instruction:
            'Keep rubbing until completely dry. No water and no air dryer for this method.',
          technique: 0,
          seconds: 6,
          effect: 'none',
        },
      ];
}
export interface Observation {
  at: number;
  hands: number;
  quality: number;
  technique: number;
  score: number;
  margin: number;
  moving: boolean;
  side: 'left' | 'right' | null;
}
export interface SimulationState {
  phase: Phase;
  clock: number;
  method: Method | null;
  source: InputSource;
  index: number;
  progress: number;
  stable: number;
  handsVerified: boolean;
  trackingGap: number;
  sides: [number, number];
  elapsed: number;
  paused: boolean;
}
export function initialState(source: InputSource = 'camera'): SimulationState {
  return {
    phase: 'approach',
    clock: 0,
    method: null,
    source,
    index: 0,
    progress: 0,
    stable: 0,
    handsVerified: false,
    trackingGap: 0,
    sides: [0, 0],
    elapsed: 0,
    paused: false,
  };
}
export function begin(s: SimulationState, method: Method): SimulationState {
  return {
    ...s,
    method,
    phase: 'session',
    index: 0,
    progress: 0,
    stable: 0,
    handsVerified: false,
    trackingGap: 0,
    sides: [0, 0],
    elapsed: 0,
  };
}
export const CAMERA_FRESHNESS_MS = 600;
export const HAND_ACQUISITION_SECONDS = 0.75;
export const MY_HANDS_SPEED_MULTIPLIER = 2;
export function accepts(_step: Step, observation: Observation | null, now: number): boolean {
  if (
    !observation ||
    !Number.isFinite(observation.at) ||
    !Number.isFinite(observation.quality) ||
    now < observation.at ||
    now - observation.at > CAMERA_FRESHNESS_MS ||
    observation.hands !== 2 ||
    observation.quality < 0.85
  )
    return false;
  // This is a camera-gated demonstration: presence is verified, not technique.
  return true;
}
export function tick(
  s: SimulationState,
  delta: number,
  now: number,
  observation: Observation | null,
): SimulationState {
  if (s.paused || s.phase === 'completed' || s.phase === 'welcome') return s;
  const dt = Math.max(0, Math.min(delta, 0.1));
  if (s.phase === 'approach' || s.phase === 'rfid') {
    const clock = s.clock + dt;
    return { ...s, clock, phase: clock >= 8 ? 'welcome' : clock >= 5.8 ? 'rfid' : 'approach' };
  }
  const step = stepsFor(s.method!)[s.index];
  const valid = s.source === 'demo' || accepts(step, observation, now);
  const trackingGap = valid ? 0 : s.trackingGap + dt;
  const stable = valid ? Math.min(HAND_ACQUISITION_SECONDS, s.stable + dt) : 0;
  // Short occlusion pauses credit without discarding acquisition. A longer loss
  // requires a fresh stable detection. No missing-hand frame earns progress.
  const handsVerified =
    s.source === 'demo' ||
    (valid
      ? s.handsVerified || stable >= HAND_ACQUISITION_SECONDS - 0.00001
      : s.handsVerified && trackingGap < 0.75);
  const speed = s.source === 'camera' ? MY_HANDS_SPEED_MULTIPLIER : 1;
  const credit = valid && handsVerified ? dt * speed : 0;
  const sides: [number, number] = [...s.sides];
  if (step.bilateral && credit) {
    const side = s.progress < step.seconds / 2 - 0.00001 ? 0 : 1;
    if (side === 0 || side === 1) sides[side] = Math.min(step.seconds / 2, sides[side] + credit);
  }
  const progress = step.bilateral ? sides[0] + sides[1] : s.progress + credit;
  if (progress + 0.00001 >= step.seconds) {
    const completed = s.index === stepsFor(s.method!).length - 1;
    return {
      ...s,
      phase: completed ? 'completed' : 'session',
      index: completed ? s.index : s.index + 1,
      progress: 0,
      sides: [0, 0],
      stable,
      handsVerified,
      trackingGap,
      elapsed: s.elapsed + dt,
    };
  }
  return { ...s, progress, stable, handsVerified, trackingGap, sides, elapsed: s.elapsed + dt };
}
