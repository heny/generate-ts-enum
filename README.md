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

## Use
```bash
# 开始一段转换
gte enum

# 查看帮助
gte enum -h

#one
gte enum -f './test/input.json' -t '测试生成' -o './test/output.ts' --type label value mapping --labelKey 'label' --valueKey 'value'
```

## 使用百度翻译
通过访问 https://api.fanyi.baidu.com/ 来创建自己的appid以及key，免费用户每日有5w字符免费翻译，个人认证用户每日有100w字符免费翻译

得到appid以及key之后，通过添加 `--bdf` 来配置，只需要配置一次即可

如果需要修改或删除自己的appid以及key，仅需要重新添加 `--bdf` 配置即可