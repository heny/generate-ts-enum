import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { toUpperCase } from './utils'
import config from './config'
import ExecutorInstance from './generate/init'
import TranslateInstance from './translate'
import { Argv, TranslateArgv, translateKeys } from './constants'
import generateCommands from './generate/command'

yargs(hideBin(process.argv))
  .command<Argv>('enum', '生成枚举和映射',
    generateCommands,
    ExecutorInstance.execFn
  )
  .command('write', '写入配置',
    (yargs) => {
      return yargs
        .option('bdf', {
          alias: 'bdfanyi',
          describe: '配置百度翻译key',
          type: 'boolean'
        })
        .option('cy', {
          alias: 'caiyun',
          describe: '配置彩云token',
          type: 'boolean'
        })
        .option('t', {
          alias: 'type',
          describe: '选择使用翻译类型',
          type: 'boolean'
        })
    },
    async function (argv) {
      if (argv.bdf) {
        await TranslateInstance.setBdFanyiKey()
      }
      if (argv.caiyun) {
        await TranslateInstance.setCaiyunToken()
      }
      if (argv.type) {
        await TranslateInstance.setTranslateType();
      }
    }
  )
  .command<TranslateArgv>('translate <query>', '翻译',
    (yargs) =>
      yargs
        .positional('query', {
          describe: '输入要翻译的文本',
          type: 'string',
        })
        .option('f', {
          alias: 'from',
          describe: '输入翻译源语言',
          type: 'string',
        })
        .option('t', {
          alias: 'to',
          describe: '输入翻译目标语言',
          type: 'string'
        })
        .option('y', {
          alias: 'type',
          describe: '输入使用翻译类型',
          type: 'string',
          choices: translateKeys
        })
        .check((argv) => {
          if (!argv.query) {
            console.log(chalk.red('请输入要翻译的文本'))
            process.exit(0)
          }
          return true
        }),
    async function (argv) {
      const result = await TranslateInstance.byTypeTranslate(argv.query, argv.type, argv.from, argv.to)
      console.log(chalk.green(result))
    }
  )
  .command<TranslateArgv>('name <query>', '转换变量名',
    (yargs) =>
      yargs
        .positional('query', {
          describe: '输入要翻译的文本',
          type: 'string',
        })
        .option('y', {
          alias: 'type',
          describe: '输入使用翻译类型',
          type: 'string',
          choices: translateKeys
        })
        .check((argv) => {
          if (!argv.query) {
            console.log(chalk.red('请输入要翻译的文本'))
            process.exit(0)
          }
          return true
        }),
    async (argv) => {
      const result = await TranslateInstance.byTypeTranslate(argv.query, argv.type, argv.from, argv.to)
      console.log(chalk.green(toUpperCase(result.split(' '))))
    }
  )
  .command('config', '获取配置文件',
    () => console.log(chalk.green('当前配置路径：', config.baseConfigPath))
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
