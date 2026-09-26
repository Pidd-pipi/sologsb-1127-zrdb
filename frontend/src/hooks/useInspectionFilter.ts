import { useMemo } from 'react';
import { useUiStore, EMPTY_FILTER, type InspectionFilter } from '../stores/uiStore';
import { usePointStore } from '../stores/pointStore';
import type { AccessPoint } from '../types/point';
import type { Inspection } from '../types/inspection';
import type { RectifyPlan } from '../types/rectify';
import { isOverdue } from '../utils/format';
import { isPassingPoint, verifyStatusOf, type VerifyStatus } from '../utils/verify';

export interface InspectionFilterResult {
  filter: InspectionFilter;
  setFilter: (patch: Partial<InspectionFilter>) => void;
  resetFilter: () => void;
  /** 按行政区、设施类型过滤后的点位 */
  filteredPoints: AccessPoint[];
  /** 在过滤点位基础上再按结论与日期过滤的核验记录 */
  filteredInspections: Inspection[];
  /** 过滤点位上未整改的整改条目 */
  pendingRectifies: RectifyPlan[];
  pointMap: Map<string, AccessPoint>;
  /** 每个点位最新一次核验 */
  latestByPoint: Map<string, Inspection>;
  /** 每个点位的核验到期状态（已逾期 / 30天内到期 / 有效 / 未安排） */
  statusByPoint: Map<string, VerifyStatus>;
  /** 已逾期点位数 */
  overdueCount: number;
  /** 30 天内到期点位数 */
  dueSoonCount: number;
  /** 有效期内点位数 */
  activeCount: number;
  /** 合格率：分子只计最新结论为合格且仍在有效期内的点位 */
  passRate: number;
}

/** 行政区 / 类型 / 结论 / 日期筛选（被 / 与 /rectify 消费） */
export function useInspectionFilter(): InspectionFilterResult {
  const filter = useUiStore((s) => s.filter);
  const setFilter = useUiStore((s) => s.setFilter);
  const resetFilter = useUiStore((s) => s.resetFilter);
  const points = usePointStore((s) => s.points);
  const inspections = usePointStore((s) => s.inspections);
  const rectifies = usePointStore((s) => s.rectifies);

  const pointMap = useMemo(() => new Map(points.map((p) => [p.id, p])), [points]);

  const filteredPoints = useMemo(
    () =>
      points.filter((p) => {
        if (filter.district && p.district !== filter.district) return false;
        if (filter.facilityType && p.facilityType !== filter.facilityType) return false;
        return true;
      }),
    [points, filter.district, filter.facilityType],
  );

  const filteredPointIds = useMemo(() => new Set(filteredPoints.map((p) => p.id)), [filteredPoints]);

  const filteredInspections = useMemo(
    () =>
      inspections.filter((i) => {
        if (!filteredPointIds.has(i.pointId)) return false;
        if (filter.conclusion && i.conclusion !== filter.conclusion) return false;
        if (filter.fromDate && i.date < filter.fromDate) return false;
        if (filter.toDate && i.date > filter.toDate) return false;
        return true;
      }),
    [inspections, filteredPointIds, filter.conclusion, filter.fromDate, filter.toDate],
  );

  const latestByPoint = useMemo(() => {
    const map = new Map<string, Inspection>();
    for (const i of inspections) {
      const cur = map.get(i.pointId);
      if (!cur || cur.date < i.date) map.set(i.pointId, i);
    }
    return map;
  }, [inspections]);

  const pendingRectifies = useMemo(
    () =>
      rectifies
        .filter((r) => filteredPointIds.has(r.pointId) && r.status !== '已整改')
        .sort((a, b) => {
          const ao = isOverdue(a.deadline, a.status) ? 0 : 1;
          const bo = isOverdue(b.deadline, b.status) ? 0 : 1;
          if (ao !== bo) return ao - bo;
          return a.deadline < b.deadline ? -1 : 1;
        }),
    [rectifies, filteredPointIds],
  );

  const passRate = useMemo(() => {
    const total = filteredPoints.length;
    if (!total) return 0;
    let pass = 0;
    for (const p of filteredPoints) {
      if (isPassingPoint(p, latestByPoint.get(p.id))) pass += 1;
    }
    return Math.round((pass / total) * 1000) / 10;
  }, [filteredPoints, latestByPoint]);

  const statusByPoint = useMemo(() => {
    const map = new Map<string, VerifyStatus>();
    for (const p of points) map.set(p.id, verifyStatusOf(p.nextVerifyDate));
    return map;
  }, [points]);

  const overdueCount = useMemo(
    () => filteredPoints.filter((p) => statusByPoint.get(p.id) === '已逾期').length,
    [filteredPoints, statusByPoint],
  );
  const dueSoonCount = useMemo(
    () => filteredPoints.filter((p) => statusByPoint.get(p.id) === '即将到期').length,
    [filteredPoints, statusByPoint],
  );
  const activeCount = useMemo(
    () => filteredPoints.filter((p) => statusByPoint.get(p.id) === '有效').length,
    [filteredPoints, statusByPoint],
  );

  return {
    filter,
    setFilter,
    resetFilter,
    filteredPoints,
    filteredInspections,
    pendingRectifies,
    pointMap,
    latestByPoint,
    statusByPoint,
    overdueCount,
    dueSoonCount,
    activeCount,
    passRate,
  };
}

export { EMPTY_FILTER };
