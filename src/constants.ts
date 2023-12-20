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
  bdFanyi?: boolean
}

export interface IConfig {
  argv: Argv
}

export interface Store {
  outputType: Array<'label' | 'value' | 'mapping'>
  baiduFanyi: {
    appid: string
    key: string
  }
}
