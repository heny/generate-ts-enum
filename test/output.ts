/**
 * 文案
 */
export const enum TestGenerationLabel {
  /**
   * 开启
   */
  Open = '开启',
  /**
   * 关闭
   */
  Close = '关闭',
  /**
   * 全部
   */
  Whole = '全部'
}
/**
 * 值
 */
export const enum TestGenerationValue {
  /**
   * 开启
   */
  Open = 1,
  /**
   * 关闭
   */
  Close = 0,
  /**
   * 全部
   */
  Whole = 2
}
/**
 * 状态List
 */
export const TestGenerationList = [
  { label: TestGenerationLabel.Open, value: TestGenerationValue.Open },
  { label: TestGenerationLabel.Close, value: TestGenerationValue.Close },
  { label: TestGenerationLabel.Whole, value: TestGenerationValue.Whole }
]
