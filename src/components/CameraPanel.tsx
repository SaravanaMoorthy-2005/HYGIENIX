import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ScanLine, ShieldCheck } from 'lucide-react';
import type { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { LandmarkSmoother } from '../cv/handPresence';
export interface TrackingFrame {
  result: HandLandmarkerResult;
  timestamp: number;
}
const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];
export default function CameraPanel({
  onFrame,
  autoStart = false,
}: {
  onFrame?: (f: TrackingFrame | null) => void;
  autoStart?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    stream = useRef<MediaStream | null>(null),
    worker = useRef<Worker | null>(null),
    tracker = useRef<HandLandmarker | null>(null),
    videoFrame = useRef(0),
    frameTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    smoother = useRef(new LandmarkSmoother()),
    generation = useRef(0),
    callback = useRef(onFrame);
  callback.current = onFrame;
  const [status, setStatus] = useState<'off' | 'loading' | 'on'>('off'),
    [error, setError] = useState(''),
    [hands, setHands] = useState(0),
    [fps, setFps] = useState(0),
    [devices, setDevices] = useState<MediaDeviceInfo[]>([]),
    [device, setDevice] = useState(''),
    [engine, setEngine] = useState('');
  const hz = 20;
  function cancelFrames() {
    if (videoFrame.current) video.current?.cancelVideoFrameCallback?.(videoFrame.current);
    if (frameTimer.current !== null) clearTimeout(frameTimer.current);
    videoFrame.current = 0;
    frameTimer.current = null;
  }
  function stop() {
    generation.current++;
    cancelFrames();
    smoother.current.reset();
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    worker.current?.terminate();
    worker.current = null;
    tracker.current?.close();
    tracker.current = null;
    if (video.current) video.current.srcObject = null;
    if (canvas.current)
      canvas.current.getContext('2d')?.clearRect(0, 0, canvas.current.width, canvas.current.height);
    setStatus('off');
    setHands(0);
    setFps(0);
    callback.current?.(null);
  }
  useEffect(
    () => () => {
      generation.current++;
      cancelFrames();
      stream.current?.getTracks().forEach((t) => t.stop());
      worker.current?.terminate();
      tracker.current?.close();
    },
    [],
  );
  async function start() {
    stop();
    const gen = generation.current;
    setError('');
    setStatus('loading');
    let busy = false,
      lastFrame = -1,
      lastAt = 0,
      previous = 0;
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error('Camera access requires HTTPS or localhost.');
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
          ...(device ? { deviceId: { exact: device } } : { facingMode: 'user' }),
        },
        audio: false,
      });
      if (gen !== generation.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      video.current!.srcObject = media;
      await video.current!.play();
      if (gen !== generation.current) return;
      const available = await navigator.mediaDevices.enumerateDevices();
      if (gen !== generation.current) return;
      setDevices(available.filter((d) => d.kind === 'videoinput'));
      media.getVideoTracks().forEach((track) =>
        track.addEventListener('ended', () => {
          if (gen !== generation.current) return;
          stop();
          setError('Camera disconnected. Reconnect it and enable the camera to resume.');
        }),
      );
      media.getVideoTracks().forEach((track) =>
        track.addEventListener('mute', () => {
          if (gen === generation.current) {
            smoother.current.reset();
            callback.current?.(null);
          }
        }),
      );
      const receive = (result: HandLandmarkerResult, timestamp: number) => {
        if (gen !== generation.current) return;
        busy = false;
        setHands(result.landmarks.length);
        if (previous) setFps(Math.round(1000 / (timestamp - previous)));
        previous = timestamp;
        const ctx = canvas.current?.getContext('2d');
        if (ctx && canvas.current && video.current) {
          const width = video.current.videoWidth || 640,
            height = video.current.videoHeight || 480;
          if (canvas.current.width !== width || canvas.current.height !== height) {
            canvas.current.width = width;
            canvas.current.height = height;
          }
          ctx.clearRect(0, 0, width, height);
          const landmarks = result.landmarks.filter(
            (hand) => hand.length === 21 && hand.every((p) => Number.isFinite(p.x + p.y + p.z)),
          );
          smoother.current.update(landmarks, timestamp).forEach((p, i) => {
            ctx.strokeStyle = i ? '#e3bd83' : '#74dac2';
            ctx.fillStyle = ctx.strokeStyle;
            ctx.lineWidth = Math.max(2, width / 320);
            ctx.lineCap = 'round';
            links.forEach(([a, b]) => {
              ctx.beginPath();
              ctx.moveTo(p[a].x * width, p[a].y * height);
              ctx.lineTo(p[b].x * width, p[b].y * height);
              ctx.stroke();
            });
            p.forEach((v) => {
              ctx.beginPath();
              ctx.arc(v.x * width, v.y * height, width / 220, 0, Math.PI * 2);
              ctx.fill();
            });
          });
        }
        callback.current?.({ result, timestamp });
      };
      try {
        if (!('OffscreenCanvas' in window)) throw new Error('No offscreen rendering');
        const w = new Worker(new URL('../cv/HandTrackingWorker.ts', import.meta.url), {
          type: 'module',
        });
        worker.current = w;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error('Worker initialization timed out')),
            15000,
          );
          w.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Worker unavailable'));
          };
          w.onmessage = (e) => {
            if (e.data.type === 'ready') {
              clearTimeout(timeout);
              resolve();
            } else if (e.data.type === 'error') {
              clearTimeout(timeout);
              reject(new Error(e.data.message));
            }
          };
          w.postMessage({ type: 'init', base: location.origin });
        });
        w.onmessage = (e) => {
          if (gen !== generation.current) return;
          if (e.data.type === 'result') receive(e.data.result, e.data.timestamp);
          else if (e.data.type === 'error') {
            stop();
            setError('Hand tracking stopped. Restart the camera to retry.');
          }
        };
        w.onerror = () => {
          if (gen !== generation.current) return;
          stop();
          setError('Hand tracking interrupted. Enable the camera to reconnect.');
        };
        setEngine('Worker · CPU');
      } catch {
        if (gen !== generation.current) return;
        worker.current?.terminate();
        worker.current = null;
        const { createTracker } = await import('../cv/MediaPipeHandTracker');
        if (gen !== generation.current) return;
        const instance = await createTracker();
        if (gen !== generation.current) {
          instance.close();
          return;
        }
        tracker.current = instance;
        setEngine('Throttled · CPU');
      }
      if (gen !== generation.current) return;
      setStatus('on');
      const schedule = () => {
        if (gen !== generation.current) return;
        if (video.current?.requestVideoFrameCallback) {
          videoFrame.current = video.current.requestVideoFrameCallback((now) => {
            void tick(now);
          });
        } else {
          frameTimer.current = setTimeout(() => {
            void tick(performance.now());
          }, 1000 / hz);
        }
      };
      const tick = async (now: number) => {
        if (gen !== generation.current) return;
        schedule();
        if (busy && now - lastAt > 1800) {
          stop();
          setError('Hand tracker stopped responding. Enable the camera to retry.');
          return;
        }
        const v = video.current;
        if (
          !v ||
          v.readyState < 2 ||
          busy ||
          now - lastAt < 1000 / hz ||
          v.currentTime === lastFrame
        )
          return;
        lastAt = now;
        lastFrame = v.currentTime;
        busy = true;
        try {
          if (worker.current) {
            const bitmap = await createImageBitmap(v);
            if (gen !== generation.current) {
              bitmap.close();
              return;
            }
            worker.current?.postMessage({ type: 'frame', bitmap, timestamp: now }, [bitmap]);
          } else if (tracker.current) receive(tracker.current.detectForVideo(v, now), now);
        } catch (e) {
          stop();
          setError(`Tracking unavailable: ${e instanceof Error ? e.message : String(e)}`);
        }
      };
      schedule();
    } catch (e) {
      if (gen !== generation.current) return;
      stop();
      setError(
        e instanceof Error ? e.message : 'Unable to start camera. Check browser permissions.',
      );
    }
  }
  const startCallback = useRef(start);
  startCallback.current = start;
  useEffect(() => {
    if (autoStart) void startCallback.current();
  }, [autoStart]);
  return (
    <div className="camera-panel">
      <div className="panel-heading">
        <span>
          <Camera size={15} /> YOUR MOVEMENT
        </span>
        <span className={status === 'on' ? 'tag green' : 'tag'}>
          {status === 'on' ? 'Live camera' : 'Camera off'}
        </span>
      </div>
      <div className="camera-view">
        <video ref={video} muted playsInline />
        <canvas ref={canvas} width={640} height={480} />
        {status !== 'on' && (
          <div className="camera-empty">
            <div className="camera-glyph">
              <ScanLine size={38} strokeWidth={1} />
            </div>
            <h3>{status === 'loading' ? 'Preparing your camera…' : 'Your technique, in focus.'}</h3>
            <p>
              Position both hands in the frame.
              <br />
              We’ll guide you from here.
            </p>
            <button className="btn primary" disabled={status === 'loading'} onClick={start}>
              <Camera size={16} />
              {status === 'loading' ? 'Loading hand tracker…' : 'Enable camera'}
            </button>
          </div>
        )}
        <div className="camera-corner tl" />
        <div className="camera-corner tr" />
        <div className="camera-corner bl" />
        <div className="camera-corner br" />
        {status === 'on' && (
          <div className="camera-overlay">
            <span>{hands} / 2 hands in frame</span>
            <span>{fps} FPS</span>
          </div>
        )}
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <div className="camera-bottom">
        <span>
          <ShieldCheck size={14} /> Private. Processed on your device.
        </span>
        {status === 'on' && (
          <button className="text-button" onClick={stop}>
            <CameraOff size={14} /> Stop
          </button>
        )}
      </div>
      {devices.length > 0 && (
        <div className="camera-config">
          <select
            aria-label="Camera device"
            value={device}
            onChange={(e) => {
              setDevice(e.target.value);
              stop();
            }}
          >
            <option value="">Default camera</option>
            {devices.map((d) => (
              <option value={d.deviceId} key={d.deviceId}>
                {d.label || 'Camera'}
              </option>
            ))}
          </select>
          <small>{engine}</small>
        </div>
      )}
    </div>
  );
}
