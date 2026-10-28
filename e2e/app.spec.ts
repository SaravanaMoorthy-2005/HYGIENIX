import { test, expect, type Page } from '@playwright/test';

// Deterministic UI workflow tests retain every 50 ms simulation tick, but render
// WebGL at 1 fps under the virtual clock. Real-frame visual checks are separate.
async function openSimulation(page: Page, renderInterval = 1000) {
  await page.clock.install();
  await page.addInitScript((renderInterval) => {
    window.requestAnimationFrame = (callback) =>
      window.setTimeout(() => callback(performance.now()), renderInterval);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }, renderInterval);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Better care/ })).toBeVisible();
  await page.clock.runFor(8500);
  await expect(page.getByRole('heading', { name: 'Hello, Dr. Maha.' })).toBeVisible();
}

test('handwash automatically completes all ten steps, including rinse and dryer', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await openSimulation(page);
  await page.getByRole('button', { name: 'Doctor demo', exact: true }).click();
  await page.getByRole('button', { name: /Handwash Water/ }).click();
  for (const [name, seconds] of [
    ['Wet your hands.', 4],
    ['Apply soap.', 3],
    ['Palm to palm.', 6],
    ['Back of hands.', 6],
    ['Between fingers.', 6],
    ['Backs of fingers.', 6],
    ['Rotate around each thumb.', 6],
    ['Fingertips & nails.', 6],
    ['Rinse your hands.', 5],
    ['Dry with warm air.', 5],
  ] as const) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue|next/i })).toHaveCount(0);
    await page.clock.runFor(seconds * 1000);
  }
  await expect(page.getByText('Hand hygiene process completed.', { exact: true })).toBeVisible();
  await expect(page.getByText('10 / 10 steps', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('sanitizer dries naturally, completes, and restart replays arrival', async ({ page }) => {
  await openSimulation(page);
  await page.getByRole('button', { name: 'Doctor demo', exact: true }).click();
  await page.getByRole('button', { name: /Sanitizer Apply/ }).click();
  await expect(page.getByRole('heading', { name: 'Apply sanitizer.' })).toBeVisible();
  await page.clock.runFor(20000);
  await expect(page.getByRole('heading', { name: 'Rub until naturally dry.' })).toBeVisible();
  await expect(page.getByLabel('Hygiene sequence')).not.toContainText('Air dry');
  await page.clock.runFor(6000);
  await expect(page.getByText('8 / 8 steps', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replay the experience' }).click();
  await expect(page.getByRole('heading', { name: /Better care/ })).toBeVisible();
});

test('camera denial holds the step and never falls back to simulated completion', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: () => Promise.reject(new DOMException('Camera permission denied', 'NotAllowedError')),
    });
  });
  await openSimulation(page);
  await page.getByRole('button', { name: /Sanitizer Apply/ }).click();
  await expect(page.getByRole('alert')).toContainText('Camera permission denied');
  await page.clock.runFor(30000);
  await expect(page.getByRole('heading', { name: 'Apply sanitizer.' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByText('Hand hygiene process completed.')).toHaveCount(0);
});

test('pause freezes progress and mobile layout stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSimulation(page);
  await page.getByRole('button', { name: 'Doctor demo', exact: true }).click();
  await page.getByRole('button', { name: /Handwash Water/ }).click();
  await page.clock.runFor(1000);
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  const before = await page.getByRole('progressbar').getAttribute('aria-valuenow');
  await page.clock.runFor(20000);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', before!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Resume simulation', exact: true }).click();
  await page.clock.runFor(3100);
  await expect(page.getByRole('heading', { name: 'Apply soap.' })).toBeVisible();
});

test('local hand tracker starts on a fake camera, detects no hands, and stops cleanly', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['camera']);
  await openSimulation(page);
  await page.getByRole('button', { name: /Sanitizer Apply/ }).click();
  await expect(page.getByText('Live camera', { exact: true })).toBeVisible({ timeout: 45000 });
  await page.clock.runFor(5000);
  await expect(page.getByText('0 / 2 hands in frame', { exact: true })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enable camera' })).toBeVisible();
  expect(
    await page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject),
  ).toBe(null);
});

test('My hands verifies presence, pauses on loss, then auto-completes without pose classification', async ({
  page,
  context,
}) => {
  test.setTimeout(180000);
  await context.grantPermissions(['camera']);
  // Synthetic landmarks exercise browser integration only, not detector accuracy.
  // The production source has no bypass or test-result injection path.
  await page.addInitScript(() => {
    const state = window as unknown as { testHandCount: number };
    state.testHandCount = 2;
    // The fake worker consumes synthetic landmarks, not pixels. Avoid real GPU
    // video readback racing the virtual clock in this deterministic integration test.
    window.createImageBitmap = (async () =>
      ({ close() {} }) as ImageBitmap) as typeof createImageBitmap;
    Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
      configurable: true,
      get: () => performance.now() / 1000,
    });
    HTMLVideoElement.prototype.requestVideoFrameCallback = function (callback) {
      return window.setTimeout(
        () => callback(performance.now(), {} as VideoFrameCallbackMetadata),
        50,
      );
    };
    HTMLVideoElement.prototype.cancelVideoFrameCallback = (id) => clearTimeout(id);
    class FakeHandWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      onerror = null;
      closed = false;
      postMessage(message: { type: string; timestamp: number; bitmap?: ImageBitmap }) {
        message.bitmap?.close();
        queueMicrotask(() => {
          if (this.closed) return;
          if (message.type === 'init') this.onmessage?.({ data: { type: 'ready' } });
          else {
            const landmarks = Array.from({ length: state.testHandCount }, (_, h) =>
              Array.from({ length: 21 }, (_, i) => ({
                x: 0.2 + h * 0.4 + (i % 4) * 0.025,
                y: 0.3 + Math.floor(i / 4) * 0.025,
                z: 0,
                visibility: 1,
              })),
            );
            this.onmessage?.({
              data: {
                type: 'result',
                timestamp: message.timestamp,
                result: { landmarks, worldLandmarks: [], handedness: [], handednesses: [] },
              },
            });
          }
        });
      }
      terminate() {
        this.closed = true;
      }
    }
    window.Worker = FakeHandWorker as unknown as typeof Worker;
  });
  await openSimulation(page, 2000);
  await page.getByRole('button', { name: /Handwash Water/ }).click();
  await expect(page.getByText('Live camera', { exact: true })).toBeVisible();
  await page.clock.runFor(2200);
  await expect(page.getByText('Both hands verified · auto-guiding', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { testHandCount: number }).testHandCount = 1;
  });
  await page.clock.runFor(1000);
  const stopped = await page.getByRole('progressbar').getAttribute('aria-valuenow');
  await page.clock.runFor(2500);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', stopped!);
  await expect(page.getByText('Bring both hands into view', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { testHandCount: number }).testHandCount = 2;
  });
  await page.clock.runFor(54000);
  await expect(page.getByText('Hand hygiene process completed.', { exact: true })).toBeVisible();
  await expect(page.getByText('10 / 10 steps', { exact: true })).toBeVisible();
  await expect(page.getByText(/Rubbing technique was not verified/)).toBeVisible();
});
