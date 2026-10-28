import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.clock.install();
  await page.addInitScript(() => {
    window.requestAnimationFrame = callback => window.setTimeout(() => callback(performance.now()), 500);
    window.cancelAnimationFrame = id => clearTimeout(id);
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://127.0.0.1:5174');
  await page.clock.runFor(2500);
  await page.screenshot({ path: 'docs/screenshots/kiosk-arrival.png' });
  await page.clock.runFor(6500);
  await page.screenshot({ path: 'docs/screenshots/kiosk-welcome.png' });
  await page.getByRole('button', { name: 'Doctor demo', exact: true }).click();
  await page.getByRole('button', { name: /Handwash Water/ }).click();
  await page.clock.runFor(9500);
  await page.screenshot({ path: 'docs/screenshots/kiosk-handwash.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(1000);
  await page.screenshot({ path: 'docs/screenshots/kiosk-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Restart simulation', exact: true }).click();
  await page.clock.runFor(9000);
  await page.getByRole('button', { name: /Sanitizer Apply/ }).click();
  await page.clock.runFor(27000);
  await page.screenshot({ path: 'docs/screenshots/kiosk-completed.png' });
  console.log('Captured arrival, welcome, handwash, mobile, and completion.');
} finally { await browser.close(); }
