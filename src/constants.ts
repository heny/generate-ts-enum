type OutputType = 'label' | 'value' | 'mapping'

export interface Argv {
  array?: string
  title: string
  file?: string
  output?: string
  labelKey: string
  valueKey: string
  inputKey?: boolean
  // 使用百度翻译
  bdfanyi?: boolean
  // 生成的类型label,value,mapping
  type: OutputType[]
}

export interface IConfig {
  argv: Argv
}

export interface Store {
  bdfanyi: {
    appid: string
    key: string
  }
}

export interface BaseConfig {
  // 百度翻译配置
  bdfinyi?: {
    appid?: string
    key?: string
  }
}
