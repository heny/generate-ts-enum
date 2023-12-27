/**
 * 文案
 */
export const enum CeShiShengChengLabel {
  /**
   * 开启
   */
  KaiQi = '开启',
  /**
   * 关闭
   */
  GuanBi = '关闭',
  /**
   * 全部
   */
  QuanBu = '全部'
}
/**
 * 值
 */
export const enum CeShiShengChengValue {
  /**
   * 开启
   */
  KaiQi = 1,
  /**
   * 关闭
   */
  GuanBi = 0,
  /**
   * 全部
   */
  QuanBu = 2
}
/**
 * 状态List
 */
export const CeShiShengChengList = [
  { label: CeShiShengChengLabel.KaiQi, value: CeShiShengChengValue.KaiQi },
  { label: CeShiShengChengLabel.GuanBi, value: CeShiShengChengValue.GuanBi },
  { label: CeShiShengChengLabel.QuanBu, value: CeShiShengChengValue.QuanBu }
]
