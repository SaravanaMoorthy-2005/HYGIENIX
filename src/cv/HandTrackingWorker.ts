import { createTracker } from './MediaPipeHandTracker';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
let tracker: HandLandmarker | null = null;
self.onmessage = async (e: MessageEvent) => {
  const { type, bitmap, timestamp, base } = e.data;
  try {
    if (type === 'init') {
      tracker = await createTracker(base);
      self.postMessage({ type: 'ready' });
    } else if (type === 'frame' && tracker) {
      const result = tracker.detectForVideo(bitmap, timestamp);
      bitmap.close();
      self.postMessage({ type: 'result', result, timestamp });
    }
  } catch (error) {
    bitmap?.close();
    self.postMessage({ type: 'error', message: String(error) });
  }
};
