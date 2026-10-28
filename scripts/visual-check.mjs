import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch({
  channel: 'chromium',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
for (const [name, path] of [
  ['overview', '/'],
  ['studio', '/station'],
  ['academy', '/academy'],
]) {
  await page.goto(`http://127.0.0.1:4173${path}`);
  await page.locator('canvas').first().waitFor();
  await page.waitForTimeout(2500);
  if (name === 'studio') {
    await page.getByRole('button', { name: 'Begin handwash' }).click();
    await page.getByRole('button', { name: 'Confirm & continue' }).click();
    await page.getByRole('button', { name: 'Confirm & continue' }).click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage: true });
}
for (const [i, title] of [
  'Palm to palm',
  'Back of hands',
  'Between fingers',
  'Backs of fingers',
  'Thumb rotation',
  'Fingertips & nails',
].entries()) {
  await page.getByRole('button', { name: new RegExp(title.replace('&', '\\&')) }).click();
  await page.waitForTimeout(1200);
  await page
    .locator('.academy-viewer')
    .screenshot({ path: `docs/screenshots/technique-${i + 1}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:4173/');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
console.log(JSON.stringify({ pageErrors: errors }));
await browser.close();
