type OutputType = 'label' | 'value' | 'mapping'

export interface Argv {
  a?: string
  array?: string

  t: string
  title: string

  f?: string
  file?: string

  o?: string
  output?: string

  labelKey: string
  valueKey: string
  inputKey?: boolean
  // 生成的类型label,value,mapping
  type: OutputType[]
}

export interface IConfig {
  argv: Argv
}

export interface Store { }

export interface BaseConfig {
  // 百度翻译配置
  bdfinyi?: {
    appid?: string
    key?: string
  }
}
