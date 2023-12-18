export interface Argv {
  array?: string
  title: string
  file?: string
  output?: string
  labelKey: string
  valueKey: string
  inputKey?: boolean
  hasOutPutFile?: boolean
}

export interface IConfig {
  argv: Argv
}
