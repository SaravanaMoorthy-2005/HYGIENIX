# Hygienex — The hygiene simulation

One full-screen 3D kiosk experience with Dr. Maha's RFID arrival, animated hand guidance, local camera tracking, and automatic handwash/sanitizer sequences. The layout, machine, doctor and existing method selection are retained.

## Run

```sh
npm install
npm run dev
```

Open the localhost URL. Production: `npm run build`, then `npm run preview`. HTTPS or localhost is required for the camera. Fonts, hand meshes, MediaPipe model and WASM are served locally. No API key is needed.

## My hands

As requested, **My hands verifies hand presence, then follows the same timed guidance as Doctor demo**. It does not classify or certify the six rubbing movements.

- Both detected hands must be stable for 0.75 seconds before progress starts.
- Each hand needs at least 85% of its landmarks in frame, a usable image size, finite landmarks, and a recent frame (at most 600 ms old).
- Progress advances automatically, without Continue buttons, while both hands remain visible.
- Missing, cropped, stale, or disconnected hand evidence pauses progress without rewinding it. A gap of 0.75 seconds requires stable reacquisition before resuming; brief occlusions preserve acquisition but never earn progress during the gap.
- Verification persists across steps; it is not restarted at each transition. Left/right indicators describe the timed guide, not measured bilateral technique.
- Restart clears verification. Pause and background tabs stop progress.

Handwash: wet → soap → six rubbing demonstrations → rinse → air dryer. Active guided time: 53 seconds.

Sanitizer: apply → six rubbing demonstrations → rub until naturally dry. Active guided time: 26 seconds. There is no water or air dryer step. Camera acquisition and interruptions add time.

## Camera and rendering

MediaPipe detects up to two hands locally. Inference uses actual video-frame callbacks, at up to 20 Hz, rather than sharing the 3D animation schedule. A worker is preferred, with CPU fallback. The drawing overlay follows the actual video dimensions and smooths landmark jitter while preserving hand identity when detector output order changes. Smoothing is visual only; raw fresh detections determine presence. Handedness ambiguity during overlap does not block presence detection.

The screen and machine retain their composition, with clearer lighting, refined enclosure materials, stainless reflections, higher-resolution shadows and high-DPI rendering. Water includes a continuous stream and basin ripples; instanced droplets reduce draw calls. Completion draws a large green check with a short halo/ripple animation. Scene memoization avoids rebuilding the 3D tree for unrelated camera/status updates.

Frames are not recorded, uploaded, or persisted. Camera denial and tracker errors hold the sequence and offer retry. Restart/completion releases the stream.

## Meaning of completion

The check means camera presence conditions and guided simulation timers were met, or the doctor demo finished. It does not prove correct rubbing technique, cleanliness, sterility, or physical dryness. RFID, water, soap, sanitizer and air events are virtual. No real-user detection accuracy study has been performed; lighting, occlusion and framing can affect detection.

The previous experimental pose matcher remains unused source; it is not part of the active progression path.

## Verification

```sh
npm run verify
npm run test:e2e
```

Unit tests cover both complete sources, equal step timing, acquisition, brief/long tracking loss, freshness, pause, reset, per-hand framing, malformed evidence and drawing continuity. Browser tests exercise the actual tracker lifecycle with a fake camera and the complete presence-gated workflow with synthetic landmark responses. These are software integration tests, not measured real-user recognition accuracy.

Original source is retained in `backups/pre-simulation-project.zip`. Asset licenses are in `ASSET_LICENSES.md` and `public/licenses/`.

