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
gte enum -t '测试生成' -f './test/input.json' -o './test/output.ts' --type label value mapping --labelKey 'label' --valueKey 'value'
```

## 使用百度翻译
通过访问 https://api.fanyi.baidu.com/ 来创建自己的appid以及key，免费用户每日有5w字符免费翻译，个人认证用户每日有100w字符免费翻译

得到appid以及key之后，通过`gte write --bdf`来配置百度，只需要配置一次即可

如果需要修改或删除自己的appid以及key，继续执行`gte write --bdf`即可

## translate
```bash
gte translate 测试
# 使用其他翻译
gte translate 关闭 -y baidu
```

## 取变量名
```bash
gte name 功能测试
# 使用其他翻译
gte translate 关闭 -y baidu
```

## PlanList
* [ ] 传入数组，生成枚举出来
  command: `gte enum -a ['test', 'demo', 'hello']`
    ```ts
    export enum Test {
      Test = 'TEST',
      Demo = 'DEMO',
      Hello = 'HELLO'
    }
    ```
* [x] 支持翻译功能
* [x] 支持获取变量名
  command: `gte name -n '生成枚举状态'`
* [ ] 接入其他翻译接口，比如有道，彩云翻译
  * [x] 接入彩云翻译
  * [ ] 接入有道
  * [ ] 接入deepl