import path from 'path'
import fs from 'fs'
import pinyin from 'pinyin'
import chalk from 'chalk'
import { translate } from '@vitalets/google-translate-api'
import flat from 'lodash/flatten'
import { toJSON, preLog } from './utils'

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
	if(/[\u4e00-\u9fa5]/.test(str)) {
		return translateToEnglish(str)
	}
	return str
}

async function generateEnumsAndMap(input, VariableName) {
  VariableName = await getVariableName(VariableName)

  const ValueName = `${VariableName}Value`
  const labelName = `${VariableName}Label`
  let statusValueEnum = `/**\n * 值\n */\nexport const enum ${ValueName} {\n`
  let statusLabelEnum = `/**\n * 文案\n */\nexport const enum ${labelName} {\n`
  let statusMap = `export const ${VariableName}Map = [\n`

  for (const [index, item] of input.entries()) {
    const varLabel = await translateToEnglish(item.label)
    const comma = index === input.length - 1 ? '' : ','
    statusValueEnum += `  /**\n   * ${item.label}\n   */\n  ${varLabel} = ${item.value}${comma}\n`
    statusLabelEnum += `  /**\n   * ${item.label}\n   */\n  ${varLabel} = '${item.label}'${comma}\n`
    statusMap += `  { value: ${ValueName}.${varLabel}, label: ${labelName}.${varLabel} }${comma}\n`
  }

  statusValueEnum += '}\n'
  statusLabelEnum += '}\n'
  statusMap += ']\n'

  console.log(statusLabelEnum + statusValueEnum + statusMap)
}

export async function byStringGenerate(input, VariableName) {
  input = toJSON(input)

  if (!Array.isArray(input)) {
    console.error(chalk.red('输入的数组不是一个有效的数组'), input)
    return Promise.reject('输入的数组不是一个有效的数组')
  }

  generateEnumsAndMap(input, VariableName)
}

export async function byFileGenerate(filePath, VariableName) {
  const rootFilePath = path.resolve(process.cwd(), filePath)

  // 检查文件是否存在
  if (fs.existsSync(rootFilePath)) {
    console.log('找到了文件：', rootFilePath)
    const content = fs.readFileSync(rootFilePath, 'utf-8')
    byStringGenerate(content, VariableName)
  } else {
    console.log(chalk.red('文件不存在：'), rootFilePath)
  }
}
