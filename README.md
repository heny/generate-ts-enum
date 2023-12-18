# 生成枚举
## input
```json
[
    { "label": "关闭", "value": 0 },
    { "label": "开启", "value": 1 },
]
```

## output
```ts
/**
 * 文案
 */
export const enum StatusLabel {
  /**
   * 关闭
   */
  Closure = '关闭',
  /**
   * 开启
   */
  TurnOn = '开启'
}
/**
 * 值
 */
export const enum StatusValue {
  /**
   * 关闭
   */
  Closure = 0,
  /**
   * 开启
   */
  TurnOn = 1
}
export const StatusMap = [
  { value: StatusValue.Closure, label: StatusLabel.Closure },
  { value: StatusValue.TurnOn, label: StatusLabel.TurnOn }
]
```