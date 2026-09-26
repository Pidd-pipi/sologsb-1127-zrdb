/** 设施类型（六个枚举值，与提示词一致） */
export type FacilityType =
  | '缘石坡道'
  | '盲道'
  | '无障碍电梯'
  | '轮椅坡道'
  | '无障碍卫生间'
  | '低位服务台';

export const FACILITY_TYPES: FacilityType[] = [
  '缘石坡道',
  '盲道',
  '无障碍电梯',
  '轮椅坡道',
  '无障碍卫生间',
  '低位服务台',
];

/** 行政区（北京市主要城区） */
export const DISTRICTS = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'] as const;

export type District = (typeof DISTRICTS)[number];

/** 养护单位 */
export const MAINTAIN_UNITS = [
  '市政道路养护一所',
  '市政道路养护二所',
  '轨道交通运营部',
  '园林绿化服务中心',
  '城管委设施科',
] as const;

/** 核验周期 */
export type ReviewCycle = '每月' | '每季度' | '每半年' | '每年';

export const REVIEW_CYCLES: ReviewCycle[] = ['每月', '每季度', '每半年', '每年'];

/** 登记时默认每年一验 */
export const DEFAULT_REVIEW_CYCLE: ReviewCycle = '每年';

/** 设施点位 */
export interface AccessPoint {
  id: string;
  /** 点位编号，例：WZ-2024-001 */
  code: string;
  name: string;
  facilityType: FacilityType;
  lng: number;
  lat: number;
  district: string;
  /** 所在道路或建筑 */
  location: string;
  /** 建成年代 */
  builtYear: number;
  maintainUnit: string;
  /** 核验周期，默认每年 */
  reviewCycle: ReviewCycle;
  /** 下次核验日期 YYYY-MM-DD，由最近一次核验日 + 周期推算；未核验时为空 */
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export type AccessPointDraft = Omit<AccessPoint, 'id' | 'createdAt' | 'updatedAt'>;
