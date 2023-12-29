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

export interface TranslateArgv {
  query: string
  from: string
  to: string
  type: TranslateKey
}

export interface IConfig {
  argv: Argv
}

export interface Store { }

export interface BaseConfig {
  // 使用什么翻译
  translateType: TranslateKey;

  // 百度翻译配置
  bdfinyi: {
    appid?: string
    key?: string
  }

  // 彩云翻译配置
  caiyun: string
}

export type TranslateKey = 'googleFree' | 'baidu' | 'caiyun'
export const translateKeys: TranslateKey[] = ['googleFree', 'baidu', 'caiyun']
export type CaiYunType = 'zh' | 'en' | 'jp'