# Deploy the kiosk simulation

This project is a static Vite build. No backend, database, secret, or API key is needed.

1. Run `npm install`, `npm run verify`, and `npm run test:e2e`.
2. Publish the `dist` folder using a Vite-compatible static host.
3. Build command: `npm run build`. Output directory: `dist`.
4. Serve over HTTPS for camera access. Localhost also works during development.

The existing `vercel.json` handles fallback URLs. Every URL renders the same simulation; there are no dashboard, academy, analytics, or ML laboratory routes.

After hosting, check both method demonstrations, the RFID arrival, pause/restart, the physical machine display, and camera permission/error handling. Confirm `/assets/hands/left.glb`, `/assets/hands/right.glb`, `/models/hand_landmarker.task`, and the MediaPipe WASM files load as binaries. Do not replace these assets with SPA fallback HTML.

My hands uses hand-presence verification followed by timed guidance; it does not classify the six rubbing movements. Browser tests cover loading, missing-hand rejection and synthetic presence-gated progression, not real-person detection accuracy. See README.md for criteria and limitations.
