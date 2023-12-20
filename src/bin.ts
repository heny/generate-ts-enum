import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import path from 'path'
import ExecutorInstance from '.'
import chalk from 'chalk'
import { Argv } from './constants'

yargs(hideBin(process.argv))
  .command<Argv>(
    'enum',
    '生成枚举和映射',
    (yargs) => {
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
        .option('bdf', {
          alias: 'bdfanyi',
          describe: '是否使用百度翻译',
          type: 'boolean',
        })
        .option('of', {
          alias: 'hasOutPutFile',
          describe: '是否需要输出文件',
          type: 'boolean',
        })
        .option('o', {
          alias: 'output',
          describe: '输出文件路径',
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
        .option('k', {
          alias: 'inputKey',
          describe: '手动输入label value key',
          type: 'boolean',
        })
        .check((argv) => {
          if (argv.o && path.extname(argv.o) !== '.ts') {
            console.log(chalk.red('输出文件必须是一个 TypeScript (.ts) 文件'))
            process.exit(1)
          }
          if (argv.f && path.extname(argv.f) !== '.json') {
            console.log(chalk.red('输入文件必须是一个 Json (.json) 文件'))
            process.exit(1)
          }
          return true
        })
    },
    ExecutorInstance.execFn
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
