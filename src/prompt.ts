import inquirer, { Answers, QuestionCollection } from 'inquirer'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { spawn } from 'child_process'
import { byStringGenerate, byFileGenerate } from './generate'
import config from './config'

function prompts<T extends Answers>(questions: QuestionCollection<T>): Promise<T> {
  return new Promise<T>((resolve) => {
    inquirer.prompt<T>(questions).then(resolve)
  })
}

async function fetchVimContent(): Promise<string> {
  return new Promise((resolve) => {
    // 创建一个临时文件
    const tempFile = path.join(os.tmpdir(), 'generate-ts-enum.json')

    const vim = spawn('vim', [tempFile], {
      stdio: 'inherit', // 这将会把子进程的stdio连接到父进程
    })

    vim.on('exit', async () => {
      // 读取临时文件的内容之后并删除
      const text = await fs.readFile(tempFile, 'utf-8')
      await fs.remove(tempFile)

      resolve(text)
    })
  })
}

export async function byPromptGetData() {
  const answers = await prompts<{ dataChoice: 'file' | 'vim' | 'input' }>([
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
    const inputAnswers = await prompts<{ content: string }>([
      {
        type: 'input',
        name: 'content',
        message: '请输入数组对象：',
      },
    ])
    config.setArgv('array', inputAnswers.content)
    byStringGenerate(inputAnswers.content)
  }

  if (answers.dataChoice === 'file') {
    const fileAnswers = await prompts<{ filePath: string }>([
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
    byFileGenerate(fileAnswers.filePath)
  }

  if (answers.dataChoice === 'vim') {
    const vimAnswers = await prompts<{ openVim: boolean }>([
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
      return byStringGenerate(content)
    }
  }
}

export async function getTitle() {
  const answers = await prompts([
    {
      type: 'input',
      name: 'title',
      message: '请输入枚举名字：',
      default: '',
    },
  ])
  return Promise.resolve(answers.title)
}

export async function getLabelKeyValue(): Promise<{ labelKey: string; valueKey: string }> {
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

  const response = await prompts(questions)
  return response
}

export async function promptOutPut(): Promise<void> {
  const answers = await prompts<{ hasOutPutFile: boolean; output: string }>([
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
        if (path.extname(fullPath) !== '.ts') {
          return '输出文件必须是一个 TypeScript (.ts) 文件'
        }

        try {
          await fs.access(fullPath, fs.constants.W_OK)
        } catch (err) {
          return `没有写入权限，请手动赋予写入权限，例如使用命令 \`${chalk.cyan(
            `chmod +w ${fullPath}`
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
