/** 生成带前缀的本地唯一 id */
export function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}

/** 今天的日期，YYYY-MM-DD */
export function todayStr(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 在指定日期上增加天数 */
export function addDays(dateStr: string, days: number): string {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  const m = `${base.getMonth() + 1}`.padStart(2, '0');
  const day = `${base.getDate()}`.padStart(2, '0');
  return `${base.getFullYear()}-${m}-${day}`;
}

/**
 * 在指定日期上增加整月数（核验周期推算用）。
 * 目标月天数不足时取该月最后一天，如 1/31 + 1 月 = 2/28（闰年 2/29）。
 */
export function addMonths(dateStr: string, months: number): string {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const day = base.getDate();
  const target = new Date(year, month + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  const m = `${target.getMonth() + 1}`.padStart(2, '0');
  const d = `${target.getDate()}`.padStart(2, '0');
  return `${target.getFullYear()}-${m}-${d}`;
}

/** 距今天还剩多少天（已过期为负数） */
export function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  const today = new Date(`${todayStr()}T00:00:00`).getTime();
  const target = new Date(`${dateStr}T00:00:00`).getTime();
  return Math.round((target - today) / 86_400_000);
}

/** 日期字符串比较，a 早于 b 返回负数 */
export function compareDate(a: string, b: string): number {
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 是否逾期：期限早于今天且状态不是已整改 */
export function isOverdue(deadline: string, status: string): boolean {
  if (!deadline) return false;
  if (status === '已整改') return false;
  return deadline < todayStr();
}

/** 百分比，保留一位小数 */
export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

/**
 * 脱代理：Zustand / React 状态对象直接写 IndexedDB 会抛 DataCloneError，
 * 落库前统一做一次纯对象深拷贝。
 */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 简单文本截断 */
export function truncate(text: string, len: number): string {
  if (!text) return '';
  return text.length > len ? `${text.slice(0, len)}…` : text;
}
