import path from 'path'
import fs from 'fs-extra'
import pinyin from 'pinyin'
import chalk from 'chalk'
import { translate } from '@vitalets/google-translate-api'
import flat from 'lodash/flatten'
import ms from 'ms'
import { evalToJSON, preLog } from './utils'
import config from './config'

// 翻译中文，需要 await 等待
function translateToEnglish(str) {
  preLog(`开始翻译：${str}`)
  return translate(str, { to: 'en' })
    .then((res) => toUpperCase(res.text.split(' ')))
    .catch((_err) => convertToPinyin(str))
}

// 将数组拼接成upper-case
function toUpperCase(arr) {
  arr = flat(arr)
  return arr.reduce((result, item) => {
    return result + item.charAt(0).toUpperCase() + item.slice(1)
  }, '')
}

// 转换拼音
function convertToPinyin(str) {
  let temp = pinyin(str, {
    style: pinyin.STYLE_NORMAL, // 设置拼音风格
    heteronym: false, // 是否启用多音字模式
  })
  return toUpperCase(temp)
}

// 获取变量名字，如果传入的是中文，则直接翻译
function getVariableName(str) {
  if (/[\u4e00-\u9fa5]/.test(str)) {
    return translateToEnglish(str)
  }
  return str
}

function outputToFile(filePath, content) {
  const outputPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  console.log('写入的路径是：', outputPath)

  fs.outputFileSync(outputPath, content)
  console.log(chalk.green(`Done: ${ms(Date.now() - config.startTime)} 🎉🎉🎉`))
}

function outputContent(label, value, mapping) {
  const types = config.getStore('outputType')
  let result = ''
  // 按照以下的顺序加
  if (types.includes('label')) {
    result += label
  }
  if (types.includes('value')) {
    result += value
  }
  if (types.includes('mapping')) {
    result += mapping
  }
  return result
}

async function generateEnumsAndMap(input) {
  if (!input || !input.length || !Array.isArray(input)) {
    console.log(chalk.red('请检查传入的数组是否存在并且有值!'))
    process.exit(0)
  }

  const { title, labelKey, valueKey, output } = config.argv
  const VariableName = await getVariableName(title)

  const ValueName = `${VariableName}Value`
  const labelName = `${VariableName}Label`
  let statusValueEnum = `/**\n * 值\n */\nexport const enum ${ValueName} {\n`
  let statusLabelEnum = `/**\n * 文案\n */\nexport const enum ${labelName} {\n`
  let statusMap = `/**\n * 状态List\n */\nexport const ${VariableName}Map = [\n`

  for (const [index, item] of input.entries()) {
    const label = item[labelKey]
    if (!label || typeof item[valueKey] === 'undefined') {
      console.log(chalk.red('错误值，请确认您的数组对象是否正确, 添加-h enum 查看帮助'))
      process.exit(1)
    }

    const varLabel = await translateToEnglish(label)
    const comma = index === input.length - 1 ? '' : ','
    statusValueEnum += `  /**\n   * ${label}\n   */\n  ${varLabel} = ${item[valueKey]}${comma}\n`
    statusLabelEnum += `  /**\n   * ${label}\n   */\n  ${varLabel} = '${label}'${comma}\n`
    statusMap += `  { value: ${ValueName}.${varLabel}, label: ${labelName}.${varLabel} }${comma}\n`
  }

  statusValueEnum += '}\n'
  statusLabelEnum += '}\n'
  statusMap += ']\n'

  const content = outputContent(statusLabelEnum, statusValueEnum, statusMap)
  if (output) {
    outputToFile(output, content)
  } else {
    console.log(content)
    console.log(chalk.green(`Done: ${ms(Date.now() - config.startTime)} 🎉🎉🎉`))
  }
}

export async function byStringGenerate(input) {
  input = evalToJSON(input)

  if (!Array.isArray(input)) {
    console.error(chalk.red('输入的数组不是一个有效的数组'), input)
    return Promise.reject('输入的数组不是一个有效的数组')
  }

  generateEnumsAndMap(input)
}

export async function byFileGenerate(filePath) {
  const rootFilePath = path.resolve(process.cwd(), filePath)

  // 检查文件是否存在
  if (await fs.pathExists(rootFilePath)) {
    console.log('找到了文件：', rootFilePath)
    const content = await fs.readFile(rootFilePath, 'utf-8')
    byStringGenerate(content)
  } else {
    console.log(chalk.red('该文件路径不存在：'), rootFilePath)
  }
}
