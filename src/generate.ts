import path from 'path'
import fs from 'fs-extra'
import pinyin from 'pinyin'
import chalk from 'chalk'
import ms from 'ms'
import TranslateInstance from './translate'
import { evalToJSON, preLog, toUpperCase } from './utils'
import config from './config'

const cnTextReg = /[\u4e00-\u9fa5]/

class EnumGenerator {
  // 翻译中文，需要 await 等待
  async translateToEnglish(str): Promise<string> {
    if (typeof str !== 'string') {
      return str
    }

    if (!cnTextReg.test(str)) {
      return toUpperCase(str.split(' '))
    }

    const base = config.baseConfig
    let result
    if(base.bdfinyi?.appid && base.bdfinyi.key) {
      result = await TranslateInstance.bdfanyi(str)
    } else {
      result = await TranslateInstance.googleFreeTranslate(str)
    }

    if(!result) {
      preLog(`拼音转换：${str}`)
      return this.convertToPinyin(str)
    }
    return toUpperCase(result.split(' '))
  }

  // 转换拼音
  convertToPinyin(str) {
    const temp = pinyin(str, {
      style: pinyin.STYLE_NORMAL, // 设置拼音风格
      heteronym: false, // 是否启用多音字模式
    })
    return toUpperCase(temp)
  }

  // 获取变量名字，如果传入的是中文，则直接翻译
  getVariableName(str) {
    if (cnTextReg.test(str)) {
      return this.translateToEnglish(str)
    }
    return str
  }

  outputToFile(filePath, content) {
    const outputPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
    console.log('写入的路径是：', outputPath)
    fs.outputFileSync(outputPath, content)
    console.log(chalk.green(`Done: ${ms(Date.now() - config.startTime)} 🎉🎉🎉`))
  }

  outputContent(label, value, mapping) {
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

  async generateEnumsAndMap(input) {
    if (!input || !input.length || !Array.isArray(input)) {
      console.log(chalk.red('请检查传入的数组是否存在并且有值!'))
      process.exit(0)
    }

    const { title, labelKey, valueKey, output } = config.argv
    const VariableName = await this.getVariableName(title)

    const ValueName = `${VariableName}Value`
    const labelName = `${VariableName}Label`
    let statusValueEnum = `/**\n * 值\n */\nexport const enum ${ValueName} {\n`
    let statusLabelEnum = `/**\n * 文案\n */\nexport const enum ${labelName} {\n`
    let statusMap = `/**\n * 状态List\n */\nexport const ${VariableName}List = [\n`

    for (let index = 0; index < input.length; index++) {
      const item = input[index]
      const label = item[labelKey]
      if (!label || typeof item[valueKey] === 'undefined') {
        console.log(chalk.red('错误值，请确认您的数组对象是否正确, 添加 -h 查看帮助'))
        process.exit(1)
      }
      const varLabel = await this.translateToEnglish(label)
      const comma = index === input.length - 1 ? '' : ','
      if (typeof item[valueKey] === 'string') {
        statusValueEnum += `  /**\n   * ${label}\n   */\n  ${varLabel} = '${item[valueKey]}'${comma}\n`
      } else {
        statusValueEnum += `  /**\n   * ${label}\n   */\n  ${varLabel} = ${item[valueKey]}${comma}\n`
      }
      statusLabelEnum += `  /**\n   * ${label}\n   */\n  ${varLabel} = '${label}'${comma}\n`
      statusMap += `  { label: ${labelName}.${varLabel}, value: ${ValueName}.${varLabel} }${comma}\n`
    }

    statusValueEnum += '}\n'
    statusLabelEnum += '}\n'
    statusMap += ']\n'

    const content = this.outputContent(statusLabelEnum, statusValueEnum, statusMap)
    if (output) {
      this.outputToFile(output, content)
    } else {
      console.log(content)
      console.log(chalk.green(`Done: ${ms(Date.now() - config.startTime)} 🎉🎉🎉`))
    }
  }

  async byStringGenerate(input) {
    input = evalToJSON(input)
    if (!Array.isArray(input)) {
      console.error(chalk.red('输入的数组不是一个有效的数组'), input)
      return Promise.reject('输入的数组不是一个有效的数组')
    }
    this.generateEnumsAndMap(input)
  }

  async byFileGenerate(filePath) {
    const rootFilePath = path.resolve(process.cwd(), filePath)
    // 检查文件是否存在
    if (await fs.pathExists(rootFilePath)) {
      console.log('找到了文件：', rootFilePath)
      const content = await fs.readFile(rootFilePath, 'utf-8')
      this.byStringGenerate(content)
    } else {
      console.log(chalk.red('该文件路径不存在：'), rootFilePath)
    }
  }
}

export default new EnumGenerator()
