import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:4173/cardio-camp/';
const OUT = '/sessions/admiring-pensive-darwin/mnt/outputs/cardio-camp-shots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });

async function shot(name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

async function reset() {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

async function loginAs(label) {
  await reset();
  await shot('00-login');
  const roleBtn = page.locator('button', { hasText: label }).first();
  await roleBtn.click();
  await page.locator('.van-checkbox').click();
  await page.getByText('一键进入演示').click();
  await page.waitForTimeout(2600);
}

// 学员
await loginAs('学员');
await shot('01-student-home');
await page.getByText('家庭血压').first().click();
await page.waitForTimeout(500);
await shot('02-student-checkin');
await page.goBack();
await page.waitForTimeout(400);
await page.getByText('档案', { exact: true }).last().click();
await page.waitForTimeout(600);
await shot('03-student-profile');
await page.getByText('活动', { exact: true }).last().click();
await page.waitForTimeout(600);
await shot('04-student-activity');

// 医师
await loginAs('医师');
await shot('05-doctor-home');
await page.getByText('患者列表').first().click();
await page.waitForTimeout(600);
await shot('06-doctor-patients');
await page.locator('button', { hasText: '张伟' }).first().click();
await page.waitForTimeout(600);
await shot('07-doctor-patient');
await page.getByText('打卡', { exact: true }).click();
await page.waitForTimeout(500);
await shot('08-doctor-patient-checkin');

// 运动师
await loginAs('运动师');
await shot('09-coach-home');
await page.getByText('运动处方', { exact: true }).first().click();
await page.waitForTimeout(600);
await shot('10-coach-rx');

// 营养师
await loginAs('营养师');
await shot('11-dietitian-home');
await page.getByText('饮食处方', { exact: true }).first().click();
await page.waitForTimeout(600);
await shot('12-dietitian-rx');

// 机构管理员
await loginAs('机构管理员');
await shot('13-org-home');

// 超级管理员
await loginAs('超级管理员');
await shot('14-admin-home');
await page.getByText('59 项功能清单').first().click();
await page.waitForTimeout(600);
await shot('15-feature-coverage');

await browser.close();
console.log('done');
