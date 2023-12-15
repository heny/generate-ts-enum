import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { byStringGenerate, byFileGenerate } from './generate'

function getVimContent() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'openVim',
          message: '是否打开vim编辑器?',
          default: false,
        },
      ])
      .then((answers) => {
        if (answers.openVim) {
          // 创建一个临时文件
          const tempFile = path.join(os.tmpdir(), 'generate-ts-enum.json')

          // 将你想要编辑的文本写入临时文件
          // fs.writeFileSync(tempFile, '这是一些初始文本\n')

          const vim = spawn('vim', [tempFile], {
            stdio: 'inherit', // 这将会把子进程的stdio连接到父进程
          })

          vim.on('exit', () => {
            // 读取临时文件的内容之后并删除
            const text = fs.readFileSync(tempFile, 'utf-8')
            fs.unlinkSync(tempFile)

            const arr = eval(text)
            resolve(arr)
          })
        }
      })
  })
}

yargs(hideBin(process.argv))
  .command(
    'gte',
    '生成枚举和映射',
    (yargs) => {
      return yargs
        .option('a', {
          alias: 'array',
          describe: '输入的数组',
          type: 'string',
        })
        .option('n', {
          alias: 'name',
          describe: '变量名,输入中文会进行翻译',
          type: 'string',
          demandOption: true,
        })
        .option('f', {
          alias: 'file',
          describe: '指定文件',
          type: 'string',
        })
    },
    async (argv) => {
      // if (!argv.name) {
      //   console.error('缺少必需的选项：-n')
      //   process.exit(1)
      // }

      if (argv.file) {
        byFileGenerate(argv.file, argv.name)
      }

      if (argv.array) {
        byStringGenerate(argv.array, argv.name)
      }

      if (!argv.file && !argv.array) {
        const array = await getVimContent()
        byStringGenerate(array, argv.name)
      }
    }
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
