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

/** 核验周期：每月 / 每季度 / 每半年 / 每年，默认每年 */
export type VerifyCycle = '每月' | '每季度' | '每半年' | '每年';

export const VERIFY_CYCLES: VerifyCycle[] = ['每月', '每季度', '每半年', '每年'];

export const DEFAULT_VERIFY_CYCLE: VerifyCycle = '每年';

/** 各周期对应的月数 */
export const VERIFY_CYCLE_MONTHS: Record<VerifyCycle, number> = {
  每月: 1,
  每季度: 3,
  每半年: 6,
  每年: 12,
};

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
  /** 核验周期，决定下次核验日期 */
  verifyCycle: VerifyCycle;
  /** 下次核验日期 YYYY-MM-DD：登记或保存核验后按实际核验日推算 */
  nextVerifyDate: string;
  createdAt: string;
  updatedAt: string;
}

export type AccessPointDraft = Omit<AccessPoint, 'id' | 'createdAt' | 'updatedAt'>;
