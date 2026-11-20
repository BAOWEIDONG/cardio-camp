/** 演示基准日：开营第 18 天（2026-12-18），所有 mock 数据围绕该日期生成 */
export const DEMO_TODAY = '2026-12-18';

const pad = (n: number) => String(n).padStart(2, '0');

export function parseDate(s: string): Date {
  const [d, t] = s.split(' ');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = (t || '00:00').split(':').map(Number);
  return new Date(y, m - 1, day, hh || 0, mm || 0);
}

export function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtDateTime(d: Date): string {
  return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addDays(base: string, n: number): string {
  const d = parseDate(base);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

export function diffDays(a: string, b: string): number {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

export function today(): string {
  return DEMO_TODAY;
}

export function nowTime(): string {
  return `${DEMO_TODAY} 09:20`;
}

/** 相对演示日的日期（负数为过去） */
export function rel(n: number): string {
  return addDays(DEMO_TODAY, n);
}

export function relTime(n: number, time = '09:20'): string {
  return `${addDays(DEMO_TODAY, n)} ${time}`;
}

export function weekdayCN(date: string): string {
  const w = ['日', '一', '二', '三', '四', '五', '六'][parseDate(date).getDay()];
  return `周${w}`;
}

export function fmtShort(date: string): string {
  const d = parseDate(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function fmtMD(date: string): string {
  const d = parseDate(date);
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
