# Verification — camera-guided simulation refinement

## Result

- TypeScript, ESLint and production build: passed.
- Unit tests: 22 passed in 3 files.
- Browser cases: all 6 passed across the initial run and targeted rerun.

## Camera progression

My hands now checks **two-hand presence**, then automatically follows the same timed sequence as Doctor demo. It does not certify individual rubbing movements. Acquisition persists across steps. Missing/invalid/stale detections pause credit; brief gaps preserve acquisition, and longer gaps require stable reacquisition. The machine animations pause with camera-gated progress while the separate reference remains available.

Unit tests cover both complete routines and both input sources, identical active step timing, acquisition, brief and sustained hand loss, stale/future/non-finite evidence, reset, pause, per-hand cropping, ambiguous handedness, small/malformed hands, drawing jitter and detector-order changes.

Browser coverage:

1. Full ten-step handwash demonstration completes automatically.
2. Sanitizer completes with natural drying and no air dryer; restart works.
3. Camera denial blocks progress without a silent demo fallback.
4. Pause/resume and mobile horizontal bounds work.
5. The real local MediaPipe implementation starts with a fake camera, reports no hands, and releases its video source when stopped.
6. Synthetic two-hand detections acquire verification, progress automatically, pause when one hand disappears, resume on reacquisition, and finish all ten handwash steps. The completion message identifies presence-guided timing rather than technique verification.

The first run of case 6 exceeded the software-rendering timeout at the last drying step. The targeted rerun passed after the test-only worker was given deterministic bitmap responses instead of reading real GPU pixels under an accelerated clock. There is no production test bypass. Workflow tests use reduced WebGL frame frequency and virtual time; they do not benchmark real-time graphics performance.

## Visual review

Refinement captures are in docs/screenshots/kiosk-refined-materials.png, kiosk-natural-water.png, kiosk-green-tick.png and kiosk-completion-mobile.png. Layout and machine geometry are retained. Changes cover neutral lighting, enclosure/stainless surface response, clearer shadows, continuous water and basin ripples, instanced droplets, and a larger animated green completion check with fading rings.

## Limits

No real-person detector accuracy study was performed. Recognition depends on framing, lighting and occlusion. Presence checks do not establish movement quality, cleanliness, sterility, or physical dryness. RFID and dispenser/dryer signals remain virtual.
