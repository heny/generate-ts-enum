import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { Argv } from '@src/constants'

export default (yargs) => {
  return yargs
    .option('a', {
      alias: 'array',
      describe: '输入的数组',
      type: 'string',
    })
    .option('t', {
      alias: 'title',
      describe: '标题名,输入中文会进行翻译',
      type: 'string',
    })
    .option('f', {
      alias: 'file',
      describe: '指定文件',
      type: 'string',
    })
    .option('o', {
      alias: 'output',
      describe: '指定输出文件路径',
      type: 'string',
    })
    .option('labelKey', {
      describe: '要转换的label key',
      type: 'string',
      default: 'label',
      demandOption: true,
      requiresArg: true,
      group: 'Options:',
      prompt: {
        message: '请输入要转换的 label key:',
        type: 'string',
      },
    })
    .option('valueKey', {
      describe: '要转换的value key',
      type: 'string',
      default: 'value',
      demandOption: true,
      requiresArg: true,
      group: 'Options:',
      prompt: {
        message: '请输入要转换的 value key:',
        type: 'string',
      },
    })
    .option('type', {
      describe: '要生成的类型',
      choices: ['label', 'value', 'mapping'],
      type: 'array',
      group: 'Options:',
    })
    .option('k', {
      alias: 'inputKey',
      describe: '手动输入label value key',
      type: 'boolean',
    })
    .check(async (argv: Argv) => {
      // 校验输入文件
      if (argv.f) {
        if (path.extname(argv.f) !== '.json') {
          console.log(chalk.red('输入文件必须是一个 Json (.json) 文件'))
          process.exit(1)
        }
        const rootFilePath = path.resolve(process.cwd(), argv.f)
        if (!(await fs.pathExists(rootFilePath))) {
          console.log(chalk.red('输入的文件不存在, 请重新输入!', rootFilePath))
          process.exit(1)
        }
        console.log(chalk.green('读取文件：'), rootFilePath)
      }

      // 校验输出文件
      if (argv.o) {
        const fullPath = path.resolve(argv.o)
        const dirPath = path.dirname(fullPath)
        if (path.extname(fullPath) !== '.ts') {
          console.log(chalk.red('输出文件必须是一个 TypeScript (.ts) 文件'))
          process.exit(0)
        }

        if (!(await fs.pathExists(argv.o))) {
          console.log(chalk.red('输出的文件不存在, 请重新输入'))
          process.exit(1)
        }

        try {
          await fs.access(dirPath, fs.constants.W_OK)
        } catch (err) {
          console.log(chalk.red(`输出文件没有写入权限，请手动赋予写入权限，例如使用命令 \`${chalk.cyan(
            `chmod +w ${dirPath}`
          )}\``))
          process.exit(0)
        }
      }
      return true
    })
}