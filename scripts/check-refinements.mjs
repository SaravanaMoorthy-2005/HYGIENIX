import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.clock.install();
  await page.addInitScript(() => {
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 500);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  });
  await page.goto('http://127.0.0.1:5174');
  await page.clock.runFor(9000);
  await page.screenshot({ path: 'docs/screenshots/kiosk-refined-materials.png' });
  await page.getByRole('button', { name: 'Doctor demo', exact: true }).click();
  await page.getByRole('button', { name: /Handwash Water/ }).click();
  await page.clock.runFor(2000);
  await page.screenshot({ path: 'docs/screenshots/kiosk-natural-water.png' });
  await page.getByRole('button', { name: 'Restart simulation', exact: true }).click();
  await page.clock.runFor(9000);
  await page.getByRole('button', { name: /Sanitizer Apply/ }).click();
  await page.clock.runFor(26700);
  await page.screenshot({ path: 'docs/screenshots/kiosk-green-tick.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(600);
  await page.screenshot({ path: 'docs/screenshots/kiosk-completion-mobile.png', fullPage: true });
  console.log('Refined materials, flowing water, animated completion, and mobile captured.');
} finally {
  await browser.close();
}
