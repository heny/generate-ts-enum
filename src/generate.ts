import path from 'path'
import fs from 'fs'
import pinyin from 'pinyin'
import chalk from 'chalk'
import { translate } from '@vitalets/google-translate-api'
import flat from 'lodash/flatten'
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
  const outputDir = path.dirname(outputPath)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    fs.accessSync(outputPath, fs.constants.W_OK)
  } catch (err) {
    console.log(chalk.red('没有写入权限。'))
    return
  }

  if (path.extname(outputPath) !== '.ts') {
    console.log(chalk.red('文件不是 TypeScript 文件。'))
    return
  }

  fs.writeFileSync(outputPath, content)
}

async function generateEnumsAndMap(input) {
  const { name, labelKey, valueKey, output } = config.argv
  const VariableName = await getVariableName(name)

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

  const content = statusLabelEnum + statusValueEnum + statusMap
  if (output) {
    outputToFile(output, content)
  } else {
    console.log(content)
  }
  console.log(chalk.green(`Done: ${Date.now() - config.startTime}ms 🎉🎉🎉`))
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
  if (fs.existsSync(rootFilePath) && fs.statSync(rootFilePath).isFile()) {
    console.log('找到了文件：', rootFilePath)
    const content = fs.readFileSync(rootFilePath, 'utf-8')
    byStringGenerate(content)
  } else {
    console.log(chalk.red('该文件路径不存在：'), rootFilePath)
  }
}
