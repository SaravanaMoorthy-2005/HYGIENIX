import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
export async function createTracker(base = location.origin) {
  const files = await FilesetResolver.forVisionTasks(`${base}/models/mediapipe/wasm`);
  return HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: `${base}/models/hand_landmarker.task`, delegate: 'CPU' },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65,
    minTrackingConfidence: 0.65,
  });
}
