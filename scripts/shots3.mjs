import { chromium } from 'playwright';
const BASE = 'http://localhost:4173/cardio-camp/';
const OUT = '/sessions/admiring-pensive-darwin/mnt/outputs/cardio-camp-shots';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
async function reset() {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}
async function login(label, file) {
  await reset();
  if (label === '学员') await page.screenshot({ path: `${OUT}/30-login-blue.png` });
  await page.locator('button', { hasText: label }).first().click();
  await page.locator('.van-checkbox').click();
  await page.getByText('一键进入演示').click();
  await page.waitForTimeout(3200);
  await page.screenshot({ path: `${OUT}/${file}` });
}
await login('学员', '31-home-blue.png');
await login('医师', '32-doctor-blue.png');
await login('超级管理员', '33-admin-blue.png');
await browser.close();
console.log('done');
