import inquirer, { Answers, QuestionCollection } from 'inquirer'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { spawn } from 'child_process'
import GenerateInstance from './generate'
import config from './config'

async function fetchVimContent(): Promise<string> {
  return new Promise((resolve) => {
    const tempFile = path.join(os.tmpdir(), 'generate-ts-enum.json')
    const vim = spawn('vim', [tempFile], {
      stdio: 'inherit',
    })

    vim.on('exit', async () => {
      const text = await fs.readFile(tempFile, 'utf-8')
      await fs.remove(tempFile)
      resolve(text)
    })
  })
}

class Prompt {
  async prompts<T extends Answers>(questions: QuestionCollection<T>): Promise<T> {
    return new Promise<T>((resolve) => {
      inquirer.prompt<T>(questions).then(resolve)
    })
  }

  async byPromptGetData() {
    console.log(
      chalk.blue(
        `当前对象的labelKey: ${config.argv.labelKey}, valueKey: ${config.argv.valueKey}, 加 -k 可自定义`
      )
    )
    const answers = await this.prompts<{ dataChoice: 'file' | 'vim' | 'input' }>([
      {
        type: 'list',
        name: 'dataChoice',
        message: '请选择提供数据的方式:',
        choices: [
          { name: '手动输入', value: 'input' },
          { name: '提供json文件', value: 'file' },
          { name: '打开Vim输入', value: 'vim' },
        ],
      },
    ])

    if (answers.dataChoice === 'input') {
      const inputAnswers = await this.prompts<{ content: string }>([
        {
          type: 'input',
          name: 'content',
          message: '请输入数组对象：',
          validate: (input) => {
            try {
              const array = eval(input)
              if (Array.isArray(array) && array.length > 0) {
                const item = array[0]
                if (
                  typeof item[config.argv.labelKey] === 'undefined' ||
                  typeof item[config.argv.valueKey] === 'undefined'
                ) {
                  return '请输入正确的key!'
                }
                return true
              } else {
                return '请输入一个非空的数组!'
              }
            } catch (e) {
              return '输入的不是一个有效的数组!'
            }
          },
        },
      ])
      config.setArgv('array', inputAnswers.content)
      GenerateInstance.byStringGenerate(inputAnswers.content)
    }

    if (answers.dataChoice === 'file') {
      const fileAnswers = await this.prompts<{ filePath: string }>([
        {
          type: 'input',
          name: 'filePath',
          message: '请输入文件的路径:',
          validate: async (input) => {
            if (path.extname(input) !== '.json') {
              return '输入文件必须是一个 Json (.json) 文件'
            }
            if (!(await fs.pathExists(input))) {
              return '输入的文件不存在, 请重新输入'
            }
            return true
          },
        },
      ])
      config.setArgv('file', fileAnswers.filePath)
      GenerateInstance.byFileGenerate(fileAnswers.filePath)
    }

    if (answers.dataChoice === 'vim') {
      const vimAnswers = await this.prompts<{ openVim: boolean }>([
        {
          type: 'confirm',
          name: 'openVim',
          message: '是否打开vim编辑器?',
          default: false,
        },
      ])

      if (vimAnswers.openVim) {
        const content = await fetchVimContent()
        config.setArgv('array', content)
        return GenerateInstance.byStringGenerate(content)
      }
    }
  }

  async getTitle() {
    const answers = await this.prompts([
      {
        type: 'input',
        name: 'title',
        message: '请输入枚举名字：',
        default: 'Status',
      },
    ])
    return Promise.resolve(answers.title)
  }

  async getLabelKeyValue(): Promise<{ labelKey: string; valueKey: string }> {
    const questions = [
      {
        type: 'text',
        name: 'labelKey',
        message: '请输入对象的labelKey：',
        default: 'label',
      },
      {
        type: 'text',
        name: 'valueKey',
        message: '请输入对象的valueKey：',
        default: 'value',
      },
    ]

    const response = await this.prompts(questions)
    return response
  }

  async promptOutPut(): Promise<void> {
    const answers = await this.prompts<{ hasOutPutFile: boolean; output: string }>([
      {
        type: 'confirm',
        name: 'hasOutPutFile',
        message: '是否需要输出文件?',
        default: false,
      },
      {
        type: 'input',
        name: 'output',
        message: '请输入输出文件的路径:',
        when: (answers) => answers.hasOutPutFile,
        validate: async (input) => {
          const fullPath = path.resolve(input)
          const dirPath = path.dirname(fullPath)
          if (path.extname(fullPath) !== '.ts') {
            return '输出文件必须是一个 TypeScript (.ts) 文件'
          }
          try {
            await fs.access(dirPath, fs.constants.W_OK)
          } catch (err) {
            return `没有写入权限，请手动赋予写入权限，例如使用命令 \`${chalk.cyan(
              `chmod +w ${dirPath}`
            )}\``
          }
          return true
        },
      },
    ])
    if (answers.hasOutPutFile) {
      config.setArgv('output', answers.output)
    }
  }

  async promptOutputType() {
    const answers = await this.prompts<{ outputContent: Array<'label' | 'value' | 'mapping'> }>([
      {
        type: 'checkbox',
        name: 'outputContent',
        message: '请选择生成输出的内容：',
        choices: [
          { name: '文案', value: 'label', checked: true },
          { name: '值', value: 'value', checked: true },
          { name: '映射', value: 'mapping', checked: true },
        ],
      },
    ])
    config.setStore('outputType', answers.outputContent)
  }
}

export default new Prompt()
