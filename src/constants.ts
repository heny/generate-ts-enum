export interface Argv {
  array?: string
  title: string
  file?: string
  output?: string
  labelKey: string
  valueKey: string
  inputKey?: boolean
  hasOutPutFile?: boolean
  // 使用百度翻译
  bdfanyi?: boolean
}

export interface IConfig {
  argv: Argv
}

export interface Store {
  outputType: Array<'label' | 'value' | 'mapping'>
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
