import type { ReviewCycle } from '../types/point';
import { addDays, todayStr } from './format';

/** 周期对应的月数 */
const CYCLE_MONTHS: Record<ReviewCycle, number> = {
  每月: 1,
  每季度: 3,
  每半年: 6,
  每年: 12,
};

/** 在指定日期上增加月数（月末日期自动回退，如 1/31 + 1月 → 2/28） */
export function addMonths(dateStr: string, months: number): string {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  const day = base.getDate();
  base.setMonth(base.getMonth() + months);
  if (base.getDate() < day) base.setDate(0);
  const m = `${base.getMonth() + 1}`.padStart(2, '0');
  const d = `${base.getDate()}`.padStart(2, '0');
  return `${base.getFullYear()}-${m}-${d}`;
}

/** 由实际核验日 + 核验周期推算下次核验日期 */
export function nextReviewDateOf(inspectDate: string, cycle: ReviewCycle): string {
  if (!inspectDate) return '';
  return addMonths(inspectDate, CYCLE_MONTHS[cycle] ?? 12);
}

/** 到期状态：已逾期 / 30天内到期 / 有效 / 未核验（无下次日期） */
export type DueStatus = 'overdue' | 'dueSoon' | 'valid' | 'none';

export const DUE_STATUS_LABEL: Record<DueStatus, string> = {
  overdue: '已逾期',
  dueSoon: '30天内到期',
  valid: '有效',
  none: '未核验',
};

/** 临期窗口：距今天多少天内算“即将到期” */
export const DUE_SOON_DAYS = 30;

export function reviewDueStatus(nextReviewDate: string, today: string = todayStr()): DueStatus {
  if (!nextReviewDate) return 'none';
  if (nextReviewDate < today) return 'overdue';
  if (nextReviewDate <= addDays(today, DUE_SOON_DAYS)) return 'dueSoon';
  return 'valid';
}
