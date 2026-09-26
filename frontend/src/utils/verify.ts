import { VERIFY_CYCLE_MONTHS, type VerifyCycle } from '../types/point';
import type { Inspection } from '../types/inspection';
import { addMonths, daysUntil, todayStr } from './format';

/** 核验到期状态：已逾期 / 30 天内到期 / 有效；未安排下次核验时单独标记 */
export type VerifyStatus = '已逾期' | '即将到期' | '有效' | '未安排';

export const VERIFY_STATUS_LABEL: Record<VerifyStatus, string> = {
  已逾期: '已逾期',
  即将到期: '30天内到期',
  有效: '有效',
  未安排: '未安排核验',
};

/** 临期窗口：下次核验日期距今 ≤ 30 天算「30天内到期」 */
export const DUE_SOON_DAYS = 30;

/** 从实际核验日 + 周期推算下次核验日期 */
export function nextVerifyDateFrom(baseDate: string, cycle: VerifyCycle): string {
  return addMonths(baseDate || todayStr(), VERIFY_CYCLE_MONTHS[cycle]);
}

/**
 * 点位核验到期状态。
 * - 没有下次核验日期：未安排（登记后、首次核验前的中间态，正常流程会登记当日为基准）
 * - 下次核验日期早于今天：已逾期
 * - 距今 30 天以内（含当天）：即将到期
 * - 其余：有效
 */
export function verifyStatusOf(nextVerifyDate: string): VerifyStatus {
  if (!nextVerifyDate) return '未安排';
  const left = daysUntil(nextVerifyDate);
  if (left < 0) return '已逾期';
  if (left <= DUE_SOON_DAYS) return '即将到期';
  return '有效';
}

/** 是否仍在有效期内（合格点位只有在有效期内才计入合格率） */
export function isVerifyActive(nextVerifyDate: string): boolean {
  return verifyStatusOf(nextVerifyDate) !== '已逾期';
}

/**
 * 该点位最新一次合格结论是否仍有效：
 * 最新结论为「合格」且下次核验日期未过期。
 */
export function isPassingPoint(point: { nextVerifyDate: string }, latest?: Inspection): boolean {
  return Boolean(latest && latest.conclusion === '合格' && isVerifyActive(point.nextVerifyDate));
}
