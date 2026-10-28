import { mkdir, cp } from 'node:fs/promises';
await mkdir('public/models/mediapipe', { recursive: true });
await cp('node_modules/@mediapipe/tasks-vision/wasm', 'public/models/mediapipe/wasm', {
  recursive: true,
});
